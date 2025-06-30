import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Properties from "../components/propertiesshow";
import Steps from "../components/Steps";
import Testimonials from "../components/Testimonials";
import Blog from "../components/Blog";

const Home = () => {
  return (
    <div className="relative">
      <Hero />
      <Features />
      <Properties />
      <Steps />
      <Testimonials />
      <Blog />
    </div>
  );
};

export default Home;
