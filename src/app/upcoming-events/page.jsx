"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
        const data = await res.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingOnly = data.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });

        upcomingOnly.sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(upcomingOnly);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-gray-500">Discover and join community service events near you.</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-500">No upcoming events found.</h2>
            <Link href="/create-event" className="btn btn-primary mt-6">Create the first one!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event._id} className="card bg-base-100 shadow-xl h-full flex flex-col">
                <figure className="h-56 w-full">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="badge badge-secondary">{event.type}</div>
                    <div className="text-sm font-semibold text-gray-500">{event.date}</div>
                  </div>
                  
                  <h2 className="card-title text-xl mb-2 line-clamp-2">{event.title}</h2>
                  
                  <div className="text-gray-600 mb-4 flex items-center gap-2">
                    <span>📍</span> {event.location}
                  </div>
                  
                  <div className="card-actions justify-end mt-auto">
                    <Link href={`/event/${event._id}`} className="btn btn-primary w-full">
                      View Event
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}