"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "../lib/auth-client"; 

export default function Navbar() {
  const router = useRouter();
  
  // BetterAuth hook to get the real logged-in user
  const { data: session, isPending } = useSession(); 
  const user = session?.user; 

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 md:px-8 sticky top-0 z-50">
      
      {/* 1. App Logo & Left Links */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-2xl font-bold">
          SocialEvents
        </Link>
        
        {/* Only show these if the user is NOT logged in */}
        {!user && !isPending && (
          <>
            <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
              Login
            </Link>
            <Link href="/register" className="btn btn-ghost hidden sm:inline-flex">
              Register
            </Link>
          </>
        )}
      </div>

      {/* 2. Navigation Links & Auth */}
      <div className="flex-none gap-4">
        
        {/* Main Desktop Menu */}
        <ul className="menu menu-horizontal px-1 hidden md:flex font-medium">
          <li>
            <Link href="/upcoming-events">Upcoming Events</Link>
          </li>
          
          {/* Show these quick links only if the user is logged in */}
          {user && (
            <>
              <li><Link href="/create-event">Create Event</Link></li>
              <li><Link href="/manage-events">Manage Events</Link></li>
            </>
          )}
        </ul>

        {/* User Auth Section */}
        {isPending ? (
          // Loading state
          <span className="loading loading-spinner loading-md text-primary"></span>
        ) : user ? (
          // Logged-in State: Profile Dropdown
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar tooltip tooltip-bottom"
              data-tip={`${user.name || "User"} (${user.email || "No email"})`} 
            >
              <div className="w-10 rounded-full border border-base-300">
                <img
                  alt="User Profile"
                  src={user.image || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`}
                />
              </div>
            </div>
            
            <ul
              tabIndex={0}
              className="mt-3 z-[100] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              {/* Mobile Fallback Links */}
              <li className="md:hidden"><Link href="/upcoming-events">Upcoming Events</Link></li>
              <li className="md:hidden"><Link href="/create-event">Create Event</Link></li>
              <li className="md:hidden"><Link href="/manage-events">Manage Events</Link></li>
              
              {/* Private Dashboard Link */}
              <li><Link href="/joined-events">Joined Events</Link></li>
              
              {/* Divider (Wrapped safely in li for DaisyUI) */}
              <li className="pointer-events-none"><div className="divider my-0"></div></li>
              
              {/* Logout Button */}
              <li>
                <button 
                  onClick={handleLogout} 
                  className="text-red-600 font-bold hover:bg-red-50 focus:text-red-700"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          // Logged-out State: Login Button Right Side
          <Link href="/login" className="btn btn-primary px-6 rounded-full">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}