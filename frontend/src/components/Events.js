import React, { useEffect, useState } from "react";
import api from "../api";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, hackathon, event

  const today = new Date();

  const isLive = (dateStr) => {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= -2;
  };

  const isUpcoming = (dateStr) => {
    if (!dateStr) return true;
    const eventDate = new Date(dateStr);
    return eventDate >= today;
  };

  useEffect(() => {
    api.get("/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "hackathon") return event.type?.toLowerCase().includes("hackathon");
    if (filter === "event") return !event.type?.toLowerCase().includes("hackathon");
    return true;
  });

  const liveEvents = filteredEvents.filter(e => isLive(e.date));
  const upcomingEvents = filteredEvents.filter(e => isUpcoming(e.date) && !isLive(e.date));
  const pastEvents = filteredEvents.filter(e => !isUpcoming(e.date) && !isLive(e.date));

  return (
    <div className="events-container">
      <div className="events-hero">
        <h2 className="events-heading">🚀 Hackathons & Events</h2>
        <p className="events-subtitle">Live, real-time events scraped from across the web</p>
      </div>

      {/* Filter Tabs */}
      <div className="events-filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({filteredEvents.length === events.length ? events.length : filteredEvents.length})
        </button>
        <button
          className={`filter-tab ${filter === "hackathon" ? "active" : ""}`}
          onClick={() => setFilter("hackathon")}
        >
          🏆 Hackathons
        </button>
        <button
          className={`filter-tab ${filter === "event" ? "active" : ""}`}
          onClick={() => setFilter("event")}
        >
          📅 Events
        </button>
      </div>

      {loading && (
        <div className="events-loading">
          <div className="spinner"></div>
          <p>Fetching latest events from multiple sources...</p>
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="events-empty">
          <p>No events found. Events will appear once the scraper finishes its first sync.</p>
        </div>
      )}

      {/* LIVE Events Section */}
      {liveEvents.length > 0 && (
        <>
          <h3 className="section-label live-label">🔴 Live Now</h3>
          <div className="events-grid">
            {liveEvents.map((event) => (
              <div key={event.id} className="event-card live-event">
                <div className="event-card-header">
                  <span className="event-type-badge">{event.type || "Event"}</span>
                  <span className="live-badge">LIVE</span>
                </div>
                <h3>{event.title}</h3>
                <p className="event-organizer">
                  <strong>🏫 Organizer:</strong> {event.organizer}
                </p>
                <p><strong>📅 Date:</strong> {event.date}</p>
                {event.location && <p><strong>📍 Location:</strong> {event.location}</p>}
                <p className="event-desc">{event.description}</p>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    <button className="know-more-btn">Register / Know More →</button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <>
          <h3 className="section-label upcoming-label">📅 Upcoming</h3>
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <span className="event-type-badge">{event.type || "Event"}</span>
                </div>
                <h3>{event.title}</h3>
                <p className="event-organizer">
                  <strong>🏫 Organizer:</strong> {event.organizer}
                </p>
                <p><strong>📅 Date:</strong> {event.date}</p>
                {event.endDate && <p><strong>📅 Ends:</strong> {event.endDate}</p>}
                {event.location && <p><strong>📍 Location:</strong> {event.location}</p>}
                <p className="event-desc">{event.description}</p>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    <button className="know-more-btn">Register / Know More →</button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <>
          <h3 className="section-label past-label">📁 Past Events</h3>
          <div className="events-grid past-grid">
            {pastEvents.map((event) => (
              <div key={event.id} className="event-card past-event">
                <div className="event-card-header">
                  <span className="event-type-badge">{event.type || "Event"}</span>
                  <span className="past-badge">Ended</span>
                </div>
                <h3>{event.title}</h3>
                <p className="event-organizer">
                  <strong>🏫 Organizer:</strong> {event.organizer}
                </p>
                <p><strong>📅 Date:</strong> {event.date}</p>
                {event.location && <p><strong>📍 Location:</strong> {event.location}</p>}
                <p className="event-desc">{event.description}</p>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    <button className="know-more-btn">View Details →</button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
