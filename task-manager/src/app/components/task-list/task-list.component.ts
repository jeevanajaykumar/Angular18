import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

declare let bootstrap: any;

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterStatus = 'all';
  sortOrder: 'asc' | 'desc' = 'desc';
  noTasksFound = false;
  taskIdToDelete: number | null = null;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
      this.sortTasks('desc');
      this.filteredTasks = tasks;
    });
  }

  // Filter tasks by status
  filterByStatus(status: string): void {
    this.filterStatus = status;
    if (status === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === status);
    }
  }

  // Sort tasks by date created (ascending or descending)
  sortTasks(order: 'asc' | 'desc'): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredTasks.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    } else {
      this.filteredTasks.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    }
  }

  // Search tasks by title within the selected filter status
  searchTasks(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTasks = this.tasks.filter(task => {
      if (this.filterStatus === 'all') {
        return task.title.toLowerCase().includes(searchTerm);
      }
      return task.status === this.filterStatus && task.title.toLowerCase().includes(searchTerm);
    });
    this.noTasksFound = this.filteredTasks.length === 0;
  }

  // Delete a task
  confirmDelete(taskId: number): void {
    this.taskIdToDelete = taskId;
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
  }

  deleteConfirmed(): void {
    if (this.taskIdToDelete !== null) {
      this.taskService.deleteTask(this.taskIdToDelete);
      this.taskIdToDelete = null;
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
      modal.hide();
    }
  }
}
