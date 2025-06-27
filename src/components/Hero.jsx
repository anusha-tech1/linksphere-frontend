import React from "react";

const Hero = () => {
  return (
    <section style={{ textAlign: "center", padding: "3rem 1rem", backgroundColor: "#eef2f3" }}>
    <h1 style={{ fontWeight: "bold" }}>Connect. Collaborate. Create.</h1>      <p>Join the platform that bridges talent and opportunities.</p>
      <div>
        <button style={{ margin: "1rem", padding: "0.5rem 1rem" }}>Find Jobs</button>
        <button style={{ margin: "1rem", padding: "0.5rem 1rem" }}>Hire Freelancers</button>
      </div>
    </section>
  );
};

export default Hero;
