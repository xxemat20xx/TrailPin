import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

import {
  LogIn,
  UserPlus,
  LogOut,
  MapPin,
  CircleUserRound,
  Compass,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll);

  return () => window.removeEventListener("scroll", onScroll);
}, []);

  return (
   <nav
    className={`
        fixed inset-x-0 z-50
        transition-all duration-300 ease-out
        ${scrolled ? "top-0" : "top-4"}
    `}
    >
    <div
        className={`
            mx-auto max-w-7xl
            transition-all duration-300
            ${
            scrolled
                ? "rounded-none md:rounded-b-2xl bg-[#1c1b1b]/95 shadow-2xl px-6 py-3"
                : "rounded-2xl bg-[#1c1b1b]/90 shadow-xl px-6 py-3"
            }
            backdrop-blur-md
            border border-white/10
            flex items-center justify-between
        `}
        >


        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <div
            className="
            w-9 h-9 rounded-xl
            bg-orange-400
            flex items-center justify-center
            group-hover:scale-110
            transition
            "
          >
            <MapPin
              className="text-white w-5 h-5 fill-white"
            />
          </div>

          <div>
            <h1 className="text-white font-bold text-xl leading-none">
              Trail<span className="text-orange-400">Pin</span>
            </h1>

            <p className="text-[10px] text-gray-400">
              Ride • Explore • Share
            </p>
          </div>
        </Link>


        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">

          <Link
            to="/explore"
            className="
            flex items-center gap-2
            text-gray-300
            hover:text-white
            transition
            "
          >
            <Compass size={18}/>
            Explore
          </Link>


          {user && (
            <>
              <Link
                to="/create"
                className="
                flex items-center gap-2
                text-gray-300
                hover:text-white
                transition
                "
              >
                <Plus size={18}/>
                Create Route
              </Link>


              <Link
                to="/trips"
                className="
                text-gray-300
                hover:text-white
                transition
                "
              >
                My Trips
              </Link>
            </>
          )}

        </div>



        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">


          {user ? (

            <>

              <button
                onClick={() => navigate("/profile")}
                className="
                flex items-center gap-2
                bg-orange-400/10
                border border-orange-400/30
                px-3 py-2
                rounded-xl
                hover:bg-orange-400/20
                transition
                "
              >
                <CircleUserRound
                  className="text-orange-400"
                  size={20}
                />

                <span className="text-gray-200 text-sm">
                  Profile
                </span>

              </button>


              <button
                onClick={handleLogout}
                className="
                text-red-400
                hover:text-red-300
                transition
                "
              >
                <LogOut size={20}/>
              </button>

            </>

          ) : (

            <>

              <Link
                to="/login"
                className="
                flex items-center gap-2
                text-gray-300
                hover:text-white
                transition
                "
              >
                <LogIn size={18}/>
                Login
              </Link>


              <Link
                to="/register"
                className="
                flex items-center gap-2
                bg-orange-400
                hover:bg-orange-500
                text-white
                px-5 py-2
                rounded-xl
                font-medium
                transition
                shadow-lg shadow-orange-400/20
                "
              >
                <UserPlus size={18}/>
                Sign Up
              </Link>

            </>

          )}

        </div>



        {/* Mobile Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white"
        >
          {
            mobileOpen
            ?
            <X/>
            :
            <Menu/>
          }
        </button>


      </div>



      {/* Mobile Menu */}

      {
        mobileOpen && (

          <div
            className="
            mx-4 mt-2
            bg-[#1c1b1b]
            border border-white/10
            rounded-2xl
            p-5
            space-y-4
            md:hidden
            "
          >

            <Link
              to="/explore"
              className="block text-gray-300"
            >
              Explore
            </Link>


            {
              user && (
                <>
                  <Link
                    to="/create"
                    className="block text-gray-300"
                  >
                    Create Route
                  </Link>


                  <Link
                    to="/trips"
                    className="block text-gray-300"
                  >
                    My Trips
                  </Link>
                </>
              )
            }


            {
              !user ? (

                <>
                  <Link
                    to="/login"
                    className="block text-gray-300"
                  >
                    Login
                  </Link>


                  <Link
                    to="/register"
                    className="
                    block text-center
                    bg-orange-400
                    text-white
                    py-2
                    rounded-xl
                    "
                  >
                    Sign Up
                  </Link>
                </>

              ) : (

                <button
                  onClick={handleLogout}
                  className="
                  flex items-center gap-2
                  text-red-400
                  "
                >
                  <LogOut size={18}/>
                  Logout
                </button>

              )
            }


          </div>

        )
      }

    </nav>
  );
}