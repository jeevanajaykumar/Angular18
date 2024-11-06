import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksKey = 'tasks'; // Local storage key
  private tasksSubject = new BehaviorSubject<Task[]>(this.loadTasksFromLocalStorage());

  constructor() {}

  // Load tasks from local storage
  private loadTasksFromLocalStorage(): Task[] {
    const tasks = localStorage.getItem(this.tasksKey);
    return tasks ? JSON.parse(tasks) : [];
  }

  // Get all tasks as an observable
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  // Add a new task
  addTask(task: Task): void {
    const tasks = this.tasksSubject.getValue();
    // Set the dateCreated when adding a new task
    const newTask = { ...task, dateCreated: new Date() }; 
    tasks.push(newTask);
    
    // Sort tasks in descending order based on dateCreated
    tasks.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

    this.updateLocalStorage(tasks);
  }

  // Update a task
  updateTask(updatedTask: Task): void {
    const tasks = this.tasksSubject.getValue();
    const index = tasks.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.updateLocalStorage(tasks);
    }
  }

  // Delete a task
  deleteTask(taskId: number): void {
    const tasks = this.tasksSubject.getValue().filter(task => task.id !== taskId);
    this.updateLocalStorage(tasks);
  }

  // Update local storage and subject
  private updateLocalStorage(tasks: Task[]): void {
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks); // Notify subscribers
  }
}
