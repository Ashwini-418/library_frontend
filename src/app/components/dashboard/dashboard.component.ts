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

    this.bookService.addBook(this.newBookTitle, this.newBookAuthor).subscribe({
      next: () => {
        this.successMessage = "Book added successfully";
        this.newBookTitle = "";
        this.newBookAuthor = "";
        this.loadBooks();
        setTimeout(() => (this.successMessage = ""), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || "Failed to add book";
      },
    });
  }

  deleteBook(id: number): void {
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
}
