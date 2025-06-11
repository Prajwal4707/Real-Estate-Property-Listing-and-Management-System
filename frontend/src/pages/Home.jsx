import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Properties from "../components/propertiesshow";
import Steps from "../components/Steps";
import Blog from "../components/Blog";

const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <Properties /> <Steps />
      <Blog />
    </div>
  );
};

export default Home;
