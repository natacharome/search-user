import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { filter } from 'rxjs/internal/operators/filter';
import { User } from 'src/app/core/interfaces/user.interface';
import { SearchService } from 'src/app/core/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  users: User[] = [];
  searchInput = new FormControl('');
  private destroy$: Subject<void> = new Subject();

  constructor(private searchService: SearchService) {}
  ngOnInit(): void {
    this.loadUsers(2);
    this.searchInput.valueChanges
      .pipe(
        filter(
          (value: string | null) =>
            value === null || /^[a-zA-Z0-9]*$/.test(value)
        ),
        distinctUntilChanged()
      )
      .subscribe((searchValue: string | null) => {
        if (!searchValue || searchValue.length >= 3) {
          for (let i = 1; i <= 2; i++) {
            this.loadUsers(i, searchValue!);
          }
        }
      });
  }

  loadUsers(page: number, search?: string): void {
    this.searchService
      .getUsers(page)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (search) {
          this.users = [
            ...response.data.filter((user: any) => {
              for (const key in user) {
                if (
                  user[key]
                    .toString()
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ) {
                  return true;
                }
              }
              return false;
            }),
          ];
        } else {
          this.users = [...response.data];
        }
      });
  }

  removeItems() {
    this.users = [];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
