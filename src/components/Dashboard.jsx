import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const API_URL = "https://67896c1c2c874e66b7d8b168.mockapi.io/library";

const Dashboard = () => {
  const navigate = useNavigate();
  const [libraryStats, setLibraryStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    availableBooks: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState({
    visitors: 245,
    rating: 4.8,
    pendingReturns: 0,
  });

  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books
        const booksResponse = await fetch(`${API_URL}/bookes`);
        const booksData = await booksResponse.json();

        // Fetch borrowers
        const borrowersResponse = await fetch(`${API_URL}/borrowers`);
        const borrowersData = await borrowersResponse.json();

        // Calculate statistics
        const totalBooks = booksData.length;
        const borrowedBooks = booksData.filter(
          (book) => book.status === "borrowed"
        ).length;
        const availableBooks = booksData.filter(
          (book) => book.status === "available"
        ).length;

        setLibraryStats({
          totalBooks,
          borrowedBooks,
          availableBooks,
        });

        // Calculate pending returns
        const pendingReturns = borrowersData.reduce((total, borrower) => {
          const pendingBooks = borrower.borrowedBooks.filter(
            (book) => !book.returned
          ).length;
          return total + pendingBooks;
        }, 0);

        setMonthlyStats((prev) => ({
          ...prev,
          pendingReturns,
        }));

        // Get users with pending books
        const usersWithPending = borrowersData.filter((user) =>
          user.borrowedBooks.some((book) => !book.returned)
        );
        setPendingUsers(usersWithPending);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <Navbar handleLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Library Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Overview of your library's current status
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              title: "Total Books",
              value: libraryStats.totalBooks,
              color: "bg-blue-500",
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              title: "Borrowed Books",
              value: libraryStats.borrowedBooks,
              color: "bg-orange-500",
              icon: "M12 4v16m8-8H4",
            },
            {
              title: "Available Books",
              value: libraryStats.availableBooks,
              color: "bg-green-500",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="transform hover:scale-105 transition-transform duration-300"
            >
              <div
                className={`${stat.color} rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={stat.icon}
                        />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <div className="text-3xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-white text-sm">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Visitors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {monthlyStats.visitors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Library Rating
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {monthlyStats.rating}/5.0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Returns
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {monthlyStats.pendingReturns}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Returns Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-red-600 mb-4">
            Users with Pending Returns ({pendingUsers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {user.borrowedBooks.filter((book) => !book.returned).length}{" "}
                    books pending
                  </span>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Pending Books:
                  </h5>
                  <ul className="space-y-2">
                    {user.borrowedBooks
                      .filter((book) => !book.returned)
                      .map((book) => (
                        <li key={book.id} className="text-sm">
                          <span className="text-gray-800">{book.title}</span>
                          <span className="text-gray-500 ml-2">
                            Due: {book.returnDate}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
