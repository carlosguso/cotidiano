CREATE TABLE `todo_items` (
	`id` text PRIMARY KEY NOT NULL,
	`todo_list_id` text NOT NULL,
	`task_id` text,
	`title` text NOT NULL,
	`completed` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`todo_list_id`) REFERENCES `todo_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `todo_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
