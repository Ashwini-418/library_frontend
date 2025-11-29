import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { BookService } from "../../services/book.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  userName: string = "";
  books: any[] = [];
  myBooks: any[] = [];

  // For adding new book
  newBookTitle = "";
  newBookAuthor = "";
  newBookStock = 1;

  // For adding stock modal
  showAddStockModal = false;
  selectedBookId: number = 0;
  additionalStock = 1;

  errorMessage = "";
  successMessage = "";

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    const user = this.authService.getUser();
    this.userName = user?.name || "";

    this.loadBooks();

    if (this.userRole === "user") {
      this.loadMyBooks();
    }
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data;
      },
      error: (err) => {
        this.errorMessage = "Failed to load books";
      },
    });
  }

  loadMyBooks(): void {
    this.bookService.getMyBooks().subscribe({
      next: (data) => {
        this.myBooks = data;
      },
      error: (err) => {
        this.errorMessage = "Failed to load your books";
      },
    });
  }

  addBook(): void {
    if (!this.newBookTitle || !this.newBookAuthor) {
      this.errorMessage = "Title and author are required";
      return;
    }

    if (this.newBookStock < 1) {
      this.errorMessage = "Stock must be at least 1";
      return;
    }

    this.bookService
      .addBook(this.newBookTitle, this.newBookAuthor, this.newBookStock)
      .subscribe({
        next: () => {
          this.successMessage = `Book added successfully with ${this.newBookStock} copies`;
          this.newBookTitle = "";
          this.newBookAuthor = "";
          this.newBookStock = 1;
          this.loadBooks();
          setTimeout(() => (this.successMessage = ""), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || "Failed to add book";
        },
      });
  }

  openAddStockModal(bookId: number): void {
    this.selectedBookId = bookId;
    this.additionalStock = 1;
    this.showAddStockModal = true;
  }

  closeAddStockModal(): void {
    this.showAddStockModal = false;
    this.selectedBookId = 0;
    this.additionalStock = 1;
  }

  addStockToBook(): void {
    if (this.additionalStock < 1) {
      this.errorMessage = "Additional stock must be at least 1";
      return;
    }

    this.bookService
      .addStock(this.selectedBookId, this.additionalStock)
      .subscribe({
        next: () => {
          this.successMessage = `Added ${this.additionalStock} copies successfully`;
          this.closeAddStockModal();
          this.loadBooks();
          setTimeout(() => (this.successMessage = ""), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || "Failed to add stock";
        },
      });
  }

  returnBook(bookId: number): void {
    if (confirm("Are you sure you want to return this book?")) {
      this.bookService.returnBook(bookId).subscribe({
        next: () => {
          this.successMessage = "Book returned successfully";
          this.loadBooks();
          this.loadMyBooks();
          setTimeout(() => (this.successMessage = ""), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || "Failed to return book";
        },
      });
    }
  }

  deleteBook(id: number): void {
    // Find the book to check for active issues
    const book = this.books.find((b) => b.id === id);

    if (book && book.available_stock < book.total_stock) {
      this.errorMessage =
        "Cannot delete book with active issues. Please wait for all copies to be returned.";
      setTimeout(() => (this.errorMessage = ""), 5000);
      return;
    }

    if (confirm("Are you sure you want to delete this book?")) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.successMessage = "Book deleted successfully";
          this.loadBooks();
          setTimeout(() => (this.successMessage = ""), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || "Failed to delete book";
        },
      });
    }
  }

  issueBook(id: number): void {
    this.bookService.issueBook(id).subscribe({
      next: () => {
        this.successMessage = "Book issued successfully";
        this.loadBooks();
        this.loadMyBooks();
        setTimeout(() => (this.successMessage = ""), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || "Failed to issue book";
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  isBookAlreadyIssued(bookId: number): boolean {
    return this.myBooks.some((book) => book.id === bookId);
  }
}
