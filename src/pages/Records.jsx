import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const initialBorrowers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    totalBill: 59.97,
    borrowedBooks: [
      { id: 1, title: "The Great Gatsby", returnDate: "2024-04-01", returned: false },
      { id: 2, title: "To Kill a Mockingbird", returnDate: "2024-03-25", returned: true },
      { id: 3, title: "1984", returnDate: "2024-04-05", returned: false }
    ],
    phone: "123-456-7890",
    address: "123 Library St, Booktown",
    membershipId: "MEM001"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    totalBill: 89.97,
    borrowedBooks: [
      { id: 3, title: "1984", returnDate: "2024-04-10", returned: false },
      { id: 4, title: "Pride and Prejudice", returnDate: "2024-04-15", returned: false },
      { id: 5, title: "The Catcher in the Rye", returnDate: "2024-04-20", returned: false }
    ],
    phone: "234-567-8901",
    address: "456 Reader Ave, Bookville",
    membershipId: "MEM002"
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    totalBill: 44.98,
    borrowedBooks: [
      { id: 6, title: "The Hobbit", returnDate: "2024-04-05", returned: false },
      { id: 7, title: "Lord of the Rings", returnDate: "2024-04-12", returned: false }
    ],
    phone: "345-678-9012",
    address: "789 Novel St, Bookland",
    membershipId: "MEM003"
  },
  // Add more borrowers with pending books...
  // Add 5 borrowers with clear records (all books returned)...
];

const Records = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowers, setBorrowers] = useState(() => {
    const storedBorrowers = localStorage.getItem("borrowers");
    return storedBorrowers ? JSON.parse(storedBorrowers) : initialBorrowers;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "clear", "pending"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Load books from localStorage
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setAvailableBooks(storedBooks.filter(book => book.status === "available"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const getBorrowerStatus = (borrower) => {
    const pendingBooks = borrower.borrowedBooks.filter(book => !book.returned).length;
    if (pendingBooks === 0) return { text: "Clear", color: "bg-green-100 text-green-800" };
    return { text: `${pendingBooks} books pending`, color: "bg-yellow-100 text-yellow-800" };
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membership ID</p>
                <p className="font-medium">{user.membershipId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{user.address}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Borrowed Books</h3>
              <div className="space-y-3">
                {user.borrowedBooks.map((book) => (
                  <div key={book.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-gray-600">Return by: {book.returnDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      book.returned ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {book.returned ? "Returned" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold">Total Bill: ${user.totalBill.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddUserModal = ({ onClose }) => {
    const [newUser, setNewUser] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      selectedBooks: [],
      membershipId: `MEM${Math.floor(Math.random() * 1000)}`,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Calculate total bill based on selected books
      const selectedBooksDetails = newUser.selectedBooks.map(bookId => {
        const book = availableBooks.find(b => b.id === bookId);
        return {
          id: book.id,
          title: book.title,
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returned: false
        };
      });

      const totalBill = selectedBooksDetails.reduce((sum, book) => {
        const bookDetails = availableBooks.find(b => b.id === book.id);
        return sum + bookDetails.price;
      }, 0);

      // Create new borrower
      const newBorrower = {
        id: Date.now(),
        ...newUser,
        borrowedBooks: selectedBooksDetails,
        totalBill
      };

      // Update books status
      const updatedBooks = JSON.parse(localStorage.getItem("books")).map(book => {
        if (newUser.selectedBooks.includes(book.id)) {
          return { ...book, status: "borrowed" };
        }
        return book;
      });
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      // Update borrowers list
      const updatedBorrowers = [...borrowers, newBorrower];
      setBorrowers(updatedBorrowers);
      localStorage.setItem("borrowers", JSON.stringify(updatedBorrowers));

      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New User</h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Select Books</label>
                <select
                  multiple
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.selectedBooks}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    selectedBooks: Array.from(e.target.selectedOptions, option => Number(option.value))
                  })}
                >
                  {availableBooks.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - ${book.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const userToDelete = borrowers.find(b => b.id === userId);
      
      // Update books status back to available
      const updatedBooks = JSON.parse(localStorage.getItem("books")).map(book => {
        if (userToDelete.borrowedBooks.some(b => b.id === book.id)) {
          return { ...book, status: "available" };
        }
        return book;
      });
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      // Remove user from borrowers
      const updatedBorrowers = borrowers.filter(b => b.id !== userId);
      setBorrowers(updatedBorrowers);
      localStorage.setItem("borrowers", JSON.stringify(updatedBorrowers));
    }
  };

  const EditUserModal = ({ user, onClose }) => {
    const [editedUser, setEditedUser] = useState(user);

    const handleBookReturn = (bookId) => {
      setEditedUser(prev => ({
        ...prev,
        borrowedBooks: prev.borrowedBooks.map(book => 
          book.id === bookId ? { ...book, returned: !book.returned } : book
        )
      }));
    };

    const handleSave = () => {
      // Update books status in localStorage
      const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");
      const updatedBooks = storedBooks.map(book => {
        const borrowedBook = editedUser.borrowedBooks.find(b => b.id === book.id);
        if (borrowedBook) {
          return { ...book, status: borrowedBook.returned ? "available" : "borrowed" };
        }
        return book;
      });
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      // Update borrowers list
      const updatedBorrowers = borrowers.map(b => 
        b.id === editedUser.id ? editedUser : b
      );
      setBorrowers(updatedBorrowers);
      localStorage.setItem("borrowers", JSON.stringify(updatedBorrowers));
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit User Record</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Borrowed Books</h3>
                {editedUser.borrowedBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-gray-600">Return by: {book.returnDate}</p>
                    </div>
                    <button
                      onClick={() => handleBookReturn(book.id)}
                      className={`px-4 py-2 rounded-md ${
                        book.returned 
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }`}
                    >
                      {book.returned ? "Returned" : "Mark as Returned"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter borrowers based on search and status
  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         borrower.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         borrower.membershipId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    const hasPendingBooks = borrower.borrowedBooks.some(book => !book.returned);
    if (statusFilter === "pending") return matchesSearch && hasPendingBooks;
    if (statusFilter === "clear") return matchesSearch && !hasPendingBooks;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar handleLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Borrowing Records</h2>
            <p className="mt-2 text-gray-600">Overview of all library members and their borrowed books</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New User
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or membership ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="pending">Pending Returns</option>
            <option value="clear">Clear Status</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBorrowers.map((borrower) => {
            const status = getBorrowerStatus(borrower);
            return (
              <div key={borrower.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => {
                      setEditingUser(borrower);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{borrower.name}</h3>
                      <p className="text-sm text-gray-600">{borrower.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Books:</span>
                      <span className="font-medium">{borrower.borrowedBooks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bill:</span>
                      <span className="font-medium">${borrower.totalBill.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUser(borrower);
                      setIsModalOpen(true);
                    }}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Show Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isAddUserModalOpen && (
          <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
        )}

        {isModalOpen && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}

        {isEditModalOpen && (
          <EditUserModal
            user={editingUser}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Records; 