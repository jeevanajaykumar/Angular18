import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId!: number;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.maxLength(50)]],
      status: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        const task = this.taskService.getTasks().subscribe((tasks) => {
          const editTask = tasks.find((t) => t.id === this.taskId);
          if (editTask) {
            this.taskForm.patchValue(editTask);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      if (this.isEditMode) {
        const updatedTask: Task = { ...this.taskForm.value, id: this.taskId };
        this.taskService.updateTask(updatedTask);
      } else {
        const newTask: Task = {
          ...this.taskForm.value,
          id: Date.now(), // Simple ID generation
        };
        this.taskService.addTask(newTask);
      }

      this.router.navigate(['/']);
    } else {
      this.taskForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
}
