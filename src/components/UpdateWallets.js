import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Spinner, ProgressBar } from "react-bootstrap";
import axios from "axios";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const API_URL = "https://axioratrade.onrender.com/api/wallets"; // 🔧 change this if needed

const WalletManager = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        type: "",
        address: "",
        memo: "",
        isDefault: false,
        url: "",
    });

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const res = await axios.get(API_URL);
            setWallets(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching wallets:", err);
            setLoading(false);
        }
    };

    const handleShowModal = (wallet = null) => {
        if (wallet) {
            setFormData(wallet);
            setIsEditing(true);
        } else {
            setFormData({ type: "", address: "", memo: "", isDefault: false, url: "" });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let downloadURL = formData.url;
            if (file) {
                const storageRef = ref(storage, `wallet_qr/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        reject,
                        async () => {
                            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            const payload = { ...formData, url: downloadURL };

            if (isEditing) {
                await axios.put(`${API_URL}/${formData._id}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }

            setShowModal(false);
            fetchWallets();
            setUploadProgress(0);
            setFile(null);
        } catch (err) {
            console.error("Error saving wallet:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteClick = (wallet) => {
        setWalletToDelete(wallet);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}/${walletToDelete._id}`);
            setWallets(wallets.filter((w) => w._id !== walletToDelete._id));
            setShowDeleteModal(false);
            setWalletToDelete(null);
        } catch (err) {
            console.error("Error deleting wallet:", err);
        }
    };

    return (
        <div className="container mt-4 p-4 border rounded shadow-sm" style={{ maxWidth: "900px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-primary mb-0">Manage Wallet Addresses</h4>
                <Button variant="success" onClick={() => handleShowModal()}>+ Add Wallet</Button>
            </div>

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped hover responsive bordered>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Address</th>
                            <th>Memo</th>
                            <th>QR Code</th>
                            <th>Default</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wallets.length > 0 ? (
                            wallets.map((wallet) => (
                                <tr key={wallet._id}>
                                    <td>{wallet.type}</td>
                                    <td>{wallet.address}</td>
                                    <td>{wallet.memo || "-"}</td>
                                    <td>
                                        {wallet.url ? (
                                            <img
                                                src={wallet.url}
                                                alt="QR"
                                                style={{ width: "50px", height: "50px", objectFit: "contain" }}
                                            />
                                        ) : (
                                            "No QR"
                                        )}
                                    </td>
                                    <td>{wallet.isDefault ? "✅" : "❌"}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleShowModal(wallet)}
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleDeleteClick(wallet)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No wallet addresses found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Wallet" : "Add Wallet"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Coin Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Memo (optional)</Form.Label>
                            <Form.Control
                                type="text"
                                name="memo"
                                value={formData.memo}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Set as Default"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>QR Code Image</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                        </Form.Group>

                        {isUploading && (
                            <ProgressBar
                                now={uploadProgress}
                                label={`${Math.round(uploadProgress)}%`}
                                className="mb-3"
                            />
                        )}

                        <div className="text-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the wallet <strong>{walletToDelete?.type}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WalletManager;
