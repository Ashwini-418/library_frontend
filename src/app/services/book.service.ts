import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addBook(
    title: string,
    author: string,
    initialStock: number = 1
  ): Observable<any> {
    return this.http.post(this.apiUrl, { title, author, initialStock });
  }

  addStock(id: number, additionalStock: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/add-stock`, {
      additionalStock,
    });
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  returnBook(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/return/${id}`, {});
  }

  issueBook(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/issue/${id}`, {});
  }

  getMyBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }
}
