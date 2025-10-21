import React from "react";
import { tasks } from "../data/dummyDashboardData";

const TaskList = () => (
  <div className="bg-white text-black rounded-2xl shadow-md p-5">
    <h4 className="text-black text-lg font-medium mb-3">Today’s Tasks</h4>
    <ul className="space-y-2">
      {tasks.map((task, index) => (
        <li key={index} className="flex justify-between items-center border-b pb-2">
          <span>{task.title}</span>
          <span
            className={`text-sm px-2 py-1 rounded ${
              task.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {task.status}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default TaskList;
