"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Instagram, Mail } from "lucide-react";

interface AboutMeProps {
  settings: any;
}

export function AboutMe({ settings }: AboutMeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="about-section-wrapper">
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-about-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{isOpen ? "Close About Me" : "About Me"}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div className={`about-section-content ${isOpen ? "is-open" : ""}`}>
        <div className="card about-card">
          {settings?.profile_image_url && (
            <img 
              src={settings.profile_image_url} 
              alt="Shruthi B" 
              className="about-profile-img"
            />
          )}

          <h1 className="gradient-text about-title">Hi!</h1>
          <p className="about-intro">
            I am Shruthi B. A Chennai girl, pursuing my Masters at IIT Madras. 
          </p>
          
          <h2 className="about-subtitle">What you can expect here:</h2>
          <div className="about-description">
            <p>
              This is a small corner of the internet where I write about life as it unfolds. Sometimes it might be about something that inspired me, a piece of advice that stayed with me, or a research paper that made me pause and think. Other times it may simply be about appreciating the small things, celebrating a few moments, or even the occasional rant.
            </p>
            <p>
              I want this space to feel raw, beautiful, imperfect and wholesome, like something written honestly in the middle of living life. If you have watched the show Modern Family, you know how every episode leaves you with a small thought to carry with you. That is the feeling I hope these pieces have. Light enough to read mindlessly, yet meaningful enough to make you pause for a second.
            </p>
            <p>
              Mostly this will be about being human, being chaotic, imperfect, sometimes causing little hurricanes, and sometimes just quietly existing. I do not really know where this will go yet, but if you are here, travel with me on this journey and I will try my best to keep you hooked.
            </p>
          </div>

          <div className="about-connect">
            <h3 className="gradient-text connect-title">Do you want to connect?</h3>
            <p className="connect-subtitle">Here are my social handles:</p>
            <div className="connect-links">
              <a href="https://instagram.com/10shruthi" target="_blank" rel="noopener noreferrer" className="btn-secondary connect-link">
                <Instagram size={18} /> Instagram
              </a>
              <a href="mailto:shruanalytics@gmail.com" className="btn-secondary connect-link">
                <Mail size={18} /> Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
