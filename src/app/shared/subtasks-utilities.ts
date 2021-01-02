import { Task } from '../models/task';

export class SubtasksUtilities {

    constructor(private repeatScheme) { }

    addSubTask(currentsubtask) {
        this.repeatScheme.subtasks.push({
            task: currentsubtask,
            completed: this.repeatScheme.completed
        });
        currentsubtask = '';

        this.repeatScheme.progress = 0;
        let progress = 0;
        this.repeatScheme.completed = true;

        this.repeatScheme.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.repeatScheme.completed = this.repeatScheme.completed && subtask.completed;
        });
        this.repeatScheme.subtasksNumber = this.repeatScheme.subtasks.length;

        this.repeatScheme.progress = progress / this.repeatScheme.subtasks.length;

        if (this.repeatScheme.completed === true) {
            this.repeatScheme.status = 'done';
        } else if (this.repeatScheme.progress > 0) {
            this.repeatScheme.status = 'ongoing';
        } else {
            this.repeatScheme.status = 'undone';
        }
    }

    toggleSubtaskStatus(i) {
        this.repeatScheme.subtasks[i].completed = !this.repeatScheme.subtasks[i].completed;

        this.repeatScheme.progress = 0;
        let progress = 0;
        this.repeatScheme.completed = true;
        this.repeatScheme.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.repeatScheme.completed = this.repeatScheme.completed && subtask.completed;
        });
        this.repeatScheme.progress = progress / this.repeatScheme.subtasks.length;
        this.repeatScheme.subtasksNumber = this.repeatScheme.subtasks.length;

        if (this.repeatScheme.completed === true) {
            this.repeatScheme.status = 'done';
        } else if (this.repeatScheme.progress > 0) {
            this.repeatScheme.status = 'ongoing';
        } else {
            this.repeatScheme.status = 'undone';
        }
    }

    deleteSubtask(i) {
        this.repeatScheme.subtasks.splice(i, 1);

        let progress = 0;
        this.repeatScheme.completed = this.repeatScheme.subtasks.length === 0 ? this.repeatScheme.completed : true;
        this.repeatScheme.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.repeatScheme.completed = this.repeatScheme.completed && subtask.completed;
        });

        this.repeatScheme.progress = this.repeatScheme.subtasks.length === 0
            ? this.repeatScheme.progress
            : progress / this.repeatScheme.subtasks.length;

        this.repeatScheme.subtasksNumber = this.repeatScheme.subtasks.length;

        if (this.repeatScheme.completed === true) {
            this.repeatScheme.status = 'done';
        } else if (this.repeatScheme.progress > 0) {
            this.repeatScheme.status = 'ongoing';
        } else {
            this.repeatScheme.status = 'undone';
        }
    }

    manageAllSubtasks() {
        if (this.repeatScheme.subtasks.length > 0) {
            this.repeatScheme.subtasks.forEach((subtask) => {
                subtask.completed = !this.repeatScheme.completed;
            });
        }

        this.repeatScheme.subtasksNumber = this.repeatScheme.subtasks.length;

        this.repeatScheme.progress = (this.repeatScheme.completed === false ? 100 : 0);

        if (this.repeatScheme.completed === false) {
            this.repeatScheme.status = 'done';
        } else if (this.repeatScheme.progress > 0) {
            this.repeatScheme.status = 'ongoing';
        } else {
            this.repeatScheme.status = 'undone';
        }
    }

}
