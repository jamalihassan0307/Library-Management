import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = "https://67896c1c2c874e66b7d8b168.mockapi.io/library";

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "available", "borrowed"
  const [availableBooks, setAvailableBooks] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/bookes`);
        const data = await response.json();
        setBooks(data);
        setAvailableBooks(data.filter((book) => book.status === "available"));
        localStorage.setItem("books", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(`${API_URL}/bookes/${bookId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updatedBooks = books.filter((book) => book.id !== bookId);
          setBooks(updatedBooks);
          localStorage.setItem("books", JSON.stringify(updatedBooks));
        }
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  const handleEdit = (book) => {
    setEditedBook({ ...book });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/bookes/${editedBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedBook),
      });

      if (response.ok) {
        const updatedBooks = books.map((book) =>
          book.id === editedBook.id ? editedBook : book
        );
        setBooks(updatedBooks);
        localStorage.setItem("books", JSON.stringify(updatedBooks));
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditedBook(null);
  };

  const EditModal = ({ book, onClose }) => {
    if (!book) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Book</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={editedBook.title}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  value={editedBook.author}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, author: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editedBook.imageUrl}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, imageUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  value={editedBook.price}
                  onChange={(e) =>
                    setEditedBook({
                      ...editedBook,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={editedBook.status}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, status: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
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
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewModal = ({ book, onClose }) => {
    if (!book) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-semibold">Author:</span> {book.author}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">ISBN:</span> {book.isbn}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Publisher:</span>{" "}
                  {book.publisher}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Published Year:</span>{" "}
                  {book.publishedYear}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Genre:</span> {book.genre}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Pages:</span> {book.pages}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Price:</span> ${book.price}
                </p>
                <p
                  className={`inline-block px-2 py-1 rounded-full text-sm ${
                    book.status === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.status}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">Description:</h3>
              <p className="mt-2 text-gray-600">{book.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddBookModal = ({ onClose }) => {
    const [newBook, setNewBook] = useState({
      title: "",
      author: "",
      imageUrl: "",
      status: "available",
      price: "",
      isbn: "",
      publisher: "",
      publishedYear: "",
      description: "",
      genre: "",
      pages: "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(`${API_URL}/bookes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newBook,
            id: Date.now().toString(),
            status: "available",
          }),
        });

        if (response.ok) {
          const addedBook = await response.json();
          const updatedBooks = [...books, addedBook];
          setBooks(updatedBooks);
          localStorage.setItem("books", JSON.stringify(updatedBooks));
        }
      } catch (error) {
        console.error("Error adding book:", error);
      }

      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.imageUrl}
                  onChange={(e) =>
                    setNewBook({ ...newBook, imageUrl: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.price}
                  onChange={(e) =>
                    setNewBook({ ...newBook, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.isbn}
                  onChange={(e) =>
                    setNewBook({ ...newBook, isbn: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.publisher}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publisher: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Published Year
                </label>
                <input
                  type="number"
                  required
                  min="1800"
                  max={new Date().getFullYear()}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.publishedYear}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publishedYear: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Genre
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.genre}
                  onChange={(e) =>
                    setNewBook({ ...newBook, genre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pages
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.pages}
                  onChange={(e) =>
                    setNewBook({ ...newBook, pages: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newBook.description}
                  onChange={(e) =>
                    setNewBook({ ...newBook, description: e.target.value })
                  }
                />
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
                Add Book
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Filter books based on search and status
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && book.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar handleLogout={handleLogout} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Library Books</h2>
            <p className="mt-2 text-gray-600">
              Manage your library's book collection
            </p>
          </div>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Book
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
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
            <option value="all">All Books</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md overflow-hidden group relative"
            >
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600">By {book.author}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      book.status === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.status}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ${book.price}
                  </span>
                </div>
              </div>
              {/* Hover overlay with buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedBook(book);
                    setIsEditMode(false);
                    setIsModalOpen(true);
                  }}
                  className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(book)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {isAddBookModalOpen && (
          <AddBookModal onClose={() => setIsAddBookModalOpen(false)} />
        )}

        {isModalOpen &&
          (isEditMode ? (
            <EditModal
              book={editedBook}
              onClose={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setEditedBook(null);
              }}
            />
          ) : (
            <ViewModal
              book={selectedBook}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedBook(null);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Books;
