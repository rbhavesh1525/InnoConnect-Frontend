import React, { useState } from "react";
import { Navbar } from "../Components/CompIndex";
const MyNetwork = () => {
  // Dummy data for now (replace with API data)
  const [connections] = useState([
    {
      id: 1,
      name: "Aarav Patel",
      bio: "Frontend Developer | React Enthusiast",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Sneha Sharma",
      bio: "AI Researcher | Passionate about Data Science",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      id: 3,
      name: "Rahul Mehta",
      bio: "Fintech Innovator | Blockchain Learner",
      image: "https://randomuser.me/api/portraits/men/40.jpg",
    },
  ]);

  const [followRequests] = useState([
    {
      id: 4,
      name: "Priya Desai",
      bio: "UI/UX Designer | Loves Minimalism",
      image: "https://randomuser.me/api/portraits/women/30.jpg",
    },
    {
      id: 5,
      name: "Karan Singh",
      bio: "Backend Engineer | Node.js Specialist",
      image: "https://randomuser.me/api/portraits/men/28.jpg",
    },
  ]);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-blue-300 shadow-blue-200 p-8">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">
          My Network
        </h2>

        {/* Follow Requests Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Follow Requests
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {followRequests.length > 0 ? (
              followRequests.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm shadow-blue-100 hover:shadow-md hover:shadow-blue-200 transition-all flex flex-col items-center text-center"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mb-3 border-2 border-blue-400 object-cover"
                  />
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {user.name}
                  </h4>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button className="text-sm text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                      Accept
                    </button>
                    <button className="text-sm text-gray-600 border border-gray-400 px-3 py-1 rounded-lg hover:bg-gray-100 transition">
                      Ignore
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center col-span-full">
                No new follow requests.
              </p>
            )}
          </div>
        </section>

        {/* My Connections Section */}
        <section className="mb-10 pt-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            My Connections
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {connections.length > 0 ? (
              connections.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm shadow-blue-100 hover:shadow-md hover:shadow-blue-200 transition-all flex flex-col items-center text-center"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mb-3 border-2 border-blue-400 object-cover"
                  />
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {user.name}
                  </h4>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                  <button className="mt-3 text-sm text-blue-600 border border-blue-400 rounded-lg px-3 py-1 hover:bg-blue-50 transition">
                    View Profile
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center col-span-full">
                No connections yet.
              </p>
            )}
          </div>
        </section>

        
      </div>
    </div>
    </>
  );
};

export default MyNetwork;
