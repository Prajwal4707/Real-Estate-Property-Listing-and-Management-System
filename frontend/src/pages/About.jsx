import React, { useEffect } from "react";
import Hero from "../components/aboutus/Hero";
import Mission from "../components/aboutus/Mission";
import Values from "../components/aboutus/Values";
import Team from "../components/aboutus/Team";
import Benefits from "../components/aboutus/Benefit";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-hidden">
      <Hero />
      <Mission />
      <Values />
      <Team />
      <Benefits />
    </div>
  );
};

export default About;
