"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
        const data = await res.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter out past events
        const upcomingOnly = data.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });

        // Sort by closest date first
        upcomingOnly.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Take only the first 6 events for the homepage
        setRecentEvents(upcomingOnly.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      
      {/* 1. Banner Section */}
      <div 
        className="hero min-h-[60vh]" 
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593113565694-c8f710f197d1?q=80&w=2070&auto=format&fit=crop)' }}
      >
        <div className="hero-overlay bg-opacity-60 bg-black"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-xl">
            <h1 className="mb-5 text-4xl md:text-5xl font-bold text-white">Empower Your Community</h1>
            <p className="mb-5 text-gray-200">
              Join hands to make a difference. Create, track, and participate in social service events happening right in your local area.
            </p>
            <Link href="/upcoming-events" className="btn btn-primary rounded-full px-8">
              Explore Events
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-24">
        
        {/* 2. Feature Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-gray-500 mt-2">Connecting volunteers with meaningful causes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl text-center">
              <div className="card-body items-center">
                <h2 className="card-title text-primary text-2xl">🌍 Create</h2>
                <p>Host events like winter clothes distribution or local cleanups.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl text-center">
              <div className="card-body items-center">
                <h2 className="card-title text-primary text-2xl">🤝 Join</h2>
                <p>Find local community events and volunteer your time easily.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl text-center">
              <div className="card-body items-center">
                <h2 className="card-title text-primary text-2xl">📈 Impact</h2>
                <p>Track your joined events and measure your social contribution.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Recent Upcoming Events Section (Now Dynamic) */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold">Recent Upcoming Events</h2>
              <p className="text-gray-500 mt-2">Join these events before it&apos;s too late</p>
            </div>
            <Link href="/upcoming-events" className="btn btn-outline btn-sm">View All</Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-semibold text-lg">
              No upcoming events at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <div key={event._id} className="card bg-base-100 shadow-xl h-full flex flex-col">
                  <figure className="h-48 w-full">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </figure>
                  <div className="card-body p-5 flex-grow">
                    <div className="badge badge-secondary mb-2">{event.type}</div>
                    <h2 className="card-title text-lg line-clamp-1">{event.title}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                    <div className="text-sm font-medium mt-2 flex items-center gap-2">
                      <span>📍</span> {event.location} | <span>📅</span> {event.date}
                    </div>
                    <div className="card-actions justify-end mt-auto pt-4">
                      <Link href={`/event/${event._id}`} className="btn btn-primary btn-sm w-full">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Gallery Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Moments of Impact</h2>
            <p className="text-gray-500 mt-2">Glimpses of our community in action</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img src="https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070&auto=format&fit=crop" alt="Gallery 1" className="rounded-box h-48 w-full object-cover shadow-sm" />
            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop" alt="Gallery 2" className="rounded-box h-48 w-full object-cover shadow-sm" />
            <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop" alt="Gallery 3" className="rounded-box h-48 w-full object-cover shadow-sm" />
            <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop" alt="Gallery 4" className="rounded-box h-48 w-full object-cover shadow-sm" />
          </div>
        </section>

        {/* 5. Newsletter Section */}
        <section className="bg-primary text-primary-content rounded-box p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6">Subscribe to our newsletter to get notified about new community events in your area.</p>
          <div className="flex justify-center">
            <div className="join w-full max-w-md">
              <input type="email" placeholder="Enter your email address" className="input input-bordered join-item w-full text-black" />
              <button className="btn btn-secondary join-item">Subscribe</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}