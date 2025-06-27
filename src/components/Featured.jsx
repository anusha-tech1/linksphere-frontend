import React from "react";

const Featured = () => {
  const features = [
    { title: "Top Freelancers", description: "Explore the best freelancers for your projects." },
    { title: "Trending Jobs", description: "Find the most sought-after job opportunities." },
  ];

  return (
    <section style={{ padding: "2rem" }}>
      <h2>Featured</h2>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {features.map((feature, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", width: "30%" }}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Featured;
