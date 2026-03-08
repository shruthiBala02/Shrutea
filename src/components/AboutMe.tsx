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
        <div className="about-card-refined">
          {settings?.profile_image_url && (
            <img 
              src={settings.profile_image_url} 
              alt="Shruthi B" 
              className="about-profile-img"
            />
          )}

          <h1 className="gradient-text about-title">Hi!</h1>
          <div className="about-description-refined">
            <p className="about-intro-refined">
              I’m Shruthi B, a Chennai girl currently pursuing my Masters.
            </p>
            
            <p>This little corner of the internet is where I write about life as it happens.</p>

            <p>
              Sometimes it might be something that inspired me. Sometimes it’s a piece of advice that refused to leave my head. Sometimes it’s a research paper that made me pause mid scroll and just think.
            </p>

            <p>
              And sometimes it might just be about the tiny, ordinary moments. The ones we usually forget to celebrate. Or the occasional rant when life decides to be dramatic.
            </p>

            <p>
              I want this space to feel raw, a little messy, beautiful, and very human. Like thoughts scribbled down in the middle of living life.
            </p>

            <p>
              If you’ve watched Modern Family, you know how every episode quietly leaves you with a small thought to carry with you through the day. That is the feeling I hope these pieces have.
            </p>

            <p>
              Light enough to read without trying too hard, but meaningful enough to make you pause for a second.
            </p>

            <p>
              Mostly this will be about being human. Being chaotic. Being imperfect. Sometimes causing little hurricanes, and sometimes just quietly existing.
            </p>

            <p>I don’t really know where this journey will go yet.</p>

            <p>But if you’re here, come along for the ride.</p>

            <p>I’ll try my best to keep things interesting :)</p>
          </div>

          <div className="about-connect-refined">
            <h3 className="gradient-text connect-title-refined">Do you want to connect?</h3>
            <div className="connect-links-refined">
              <a href="https://instagram.com/10shruthi" target="_blank" rel="noopener noreferrer" className="btn-secondary connect-link-refined">
                <Instagram size={18} /> Instagram
              </a>
              <a href="mailto:shruanalytics@gmail.com" className="btn-secondary connect-link-refined">
                <Mail size={18} /> Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
