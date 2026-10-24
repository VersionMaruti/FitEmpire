'use client';

import React, { useState } from 'react';
import { Star, Quote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Ananya Deshmukh',
    role: 'Product Designer • Bengaluru',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    rating: 5,
    tag: 'Lost 12 Kgs in 5 Months',
    review: 'FitEmpire completely unlocked my fitness! I go to Cult for HIIT near my office in the morning and swim at Bengaluru Club on weekends. The 60-second dynamic QR check-in is so seamless.'
  },
  {
    name: 'Vikram Singhania',
    role: 'Gym Owner • Golds Gym Koramangala',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
    rating: 5,
    tag: 'Partner Gym Owner',
    review: 'Our afternoon slots between 12 PM to 4 PM used to be empty. FitEmpire brings 40-50 verified members daily and pays out weekly without fail. Best partner platform in India!'
  },
  {
    name: 'Rohan Mehta',
    role: 'VP Engineering • Mumbai',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    rating: 5,
    tag: 'Frequent Traveler',
    review: 'I travel between Delhi, Bangalore and Mumbai every week. Having one pass that works across premium gyms, airport fitness lounges, and local studios is an absolute game-changer.'
  },
  {
    name: 'Kavita Nair',
    role: 'Yoga & Pilates Practitioner • Hyderabad',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop',
    rating: 5,
    tag: 'Daily Pass User',
    review: 'The variety is unbeatable. From Reformer Pilates in Jubilee Hills to Olympic-size swimming in Gachibowli, I never get bored with my daily fitness routine anymore.'
  }
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 45;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < REVIEWS.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : REVIEWS.length - 1));
  };

  // Touch gesture handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  // Mouse drag handlers for desktop DevTools emulation
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    setTouchEndX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    handleTouchEnd();
  };

  return (
    <section className="testimonials-purple-section">
      <div className="container">
        
        <div className="test-header-center">
          <div className="badge-pill-purple">
            <Sparkles size={13} className="text-purple" />
            <span>MEMBER & PARTNER EXPERIENCES</span>
          </div>
          <h2 className="test-title">
            Loved by Members. <span className="text-purple-gradient">Trusted by 12,000+ Gyms.</span>
          </h2>
          <p className="test-subtitle">Over 2,500,000+ verified workouts completed across India.</p>
        </div>

        {/* Desktop View: Grid Layout */}
        <div className="reviews-cards-grid desktop-only-grid">
          {REVIEWS.slice(0, 3).map((rev, i) => (
            <div key={i} className="review-card-box executive-card">
              <Quote size={28} className="review-quote-bg" />
              
              <div className="stars-row">
                {[...Array(rev.rating)].map((_, idx) => (
                  <Star key={idx} size={15} fill="#D97706" color="#D97706" />
                ))}
              </div>

              <p className="review-comment">"{rev.review}"</p>

              <div className="author-row">
                <img src={rev.photo} alt={rev.name} className="author-photo" />
                <div className="author-details">
                  <strong className="author-name">{rev.name}</strong>
                  <span className="author-role">{rev.role}</span>
                  <span className="author-tag text-purple">{rev.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile / Tablet Carousel: Touch-Swipeable */}
        <div className="mobile-carousel-wrapper">
          <div
            className="mobile-carousel-viewport"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="mobile-carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {REVIEWS.map((rev, i) => (
                <div key={i} className="mobile-carousel-slide">
                  <div className="review-card-box executive-card mobile-card-inner">
                    <Quote size={28} className="review-quote-bg" />
                    
                    <div className="stars-row">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} size={15} fill="#D97706" color="#D97706" />
                      ))}
                    </div>

                    <p className="review-comment">"{rev.review}"</p>

                    <div className="author-row">
                      <img src={rev.photo} alt={rev.name} className="author-photo" />
                      <div className="author-details">
                        <strong className="author-name">{rev.name}</strong>
                        <span className="author-role">{rev.role}</span>
                        <span className="author-tag text-purple">{rev.tag}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls: Arrows + Dots */}
          <div className="carousel-controls-row">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonial"
              className="carousel-nav-btn"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="carousel-dots-container">
              {REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`carousel-dot ${currentIndex === idx ? 'active-dot' : ''}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              aria-label="Next Testimonial"
              className="carousel-nav-btn"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="carousel-swipe-hint">
            <span>👈 Swipe left or right to explore reviews 👉</span>
          </div>
        </div>

      </div>

      <style>{`
        .testimonials-purple-section {
          padding: 70px 0;
          background: #FFFFFF;
        }
        .test-header-center {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        .test-title {
          font-size: 38px;
          font-weight: 900;
          color: #0F172A;
          margin: 12px 0 8px;
        }
        .test-subtitle {
          font-size: 16px;
          color: #64748B;
        }
        .reviews-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .review-card-box {
          padding: 28px;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #FFFFFF;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .review-quote-bg {
          color: #E2E8F0;
          position: absolute;
          top: 20px;
          right: 20px;
        }
        .stars-row {
          display: flex;
          gap: 3px;
          margin-bottom: 12px;
        }
        .review-comment {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.6;
          margin-bottom: 22px;
          flex: 1;
        }
        .author-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }
        .author-photo {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #E2E8F0;
        }
        .author-details {
          display: flex;
          flex-direction: column;
        }
        .author-name {
          font-size: 14px;
          color: #0F172A;
        }
        .author-role {
          font-size: 11px;
          color: #64748B;
        }
        .author-tag {
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          color: #7C3AED;
        }

        /* Mobile Carousel Styles */
        .mobile-carousel-wrapper {
          display: none;
        }

        @media (max-width: 960px) {
          .desktop-only-grid {
            display: none !important;
          }

          .mobile-carousel-wrapper {
            display: block;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            position: relative;
          }

          .mobile-carousel-viewport {
            overflow: hidden;
            width: 100%;
            border-radius: 20px;
            cursor: grab;
            touch-action: pan-y;
            user-select: none;
          }

          .mobile-carousel-viewport:active {
            cursor: grabbing;
          }

          .mobile-carousel-track {
            display: flex;
            width: 100%;
            will-change: transform;
          }

          .mobile-carousel-slide {
            flex: 0 0 100%;
            width: 100%;
            box-sizing: border-box;
            padding: 4px;
          }

          .mobile-card-inner {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(124, 58, 237, 0.15);
          }

          .carousel-controls-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 20px;
          }

          .carousel-nav-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .carousel-nav-btn:hover {
            background: #7C3AED;
            color: #FFFFFF;
            border-color: #7C3AED;
            transform: scale(1.05);
          }

          .carousel-dots-container {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .carousel-dot {
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background: #CBD5E1;
            border: none;
            cursor: pointer;
            padding: 0;
            transition: all 0.25s ease;
          }

          .carousel-dot.active-dot {
            width: 24px;
            background: #7C3AED;
            border-radius: 6px;
          }

          .carousel-swipe-hint {
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            margin-top: 10px;
            font-weight: 600;
          }
        }
      `}</style>
    </section>
  );
};

