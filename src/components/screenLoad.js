function ScreenLoad() {
    return (
      <div className="loading-overlay">
        <dotlottie-player
          src="https://lottie.host/e32b8cad-8004-4b58-a9a1-0e897176dac6/6bhtN86qL6.lottie"
          background="transparent"
          speed="1"
          style={{ width: "150px", height: "150px" }}  // ✅ Fixed style
          loop
          autoplay
        ></dotlottie-player>
        {/* <div className="loading-spinner"></div>
        <p>Loading user data...</p> */}
      </div>
    );
  }
  
  export default ScreenLoad;
  