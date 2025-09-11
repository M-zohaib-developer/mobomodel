// import React, { useState } from "react";
// import {
//   Plus,
//   Search,
//   Filter,
//   Edit2,
//   Trash2,
//   CheckCircle,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import { useApp } from "../../context/AppContext";
// import { Task } from "../types";

// interface TasksPageProps {
//   onNavigate: (page: string) => void;
// }

// export function TasksPage({ onNavigate }: TasksPageProps) {
//   const { state, dispatch } = useApp();
//   const { tasks, settings } = state;
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterPriority, setFilterPriority] = useState("all");
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [taskForm, setTaskForm] = useState({
//     title: "",
//     description: "",
//     priority: "medium" as Task["priority"],
//     dueDate: "",
//     status: "pending" as Task["status"],
//   });

//   const filteredTasks = tasks.filter((task) => {
//     const matchesSearch =
//       task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       task.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       filterStatus === "all" || task.status === filterStatus;
//     const matchesPriority =
//       filterPriority === "all" || task.priority === filterPriority;
//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   const handleCreateTask = () => {
//     setEditingTask(null);
//     setTaskForm({
//       title: "",
//       description: "",
//       priority: "medium",
//       dueDate: "",
//       status: "pending",
//     });
//     setShowTaskModal(true);
//   };

//   const handleEditTask = (task: Task) => {
//     setEditingTask(task);
//     setTaskForm({
//       title: task.title,
//       description: task.description,
//       priority: task.priority,
//       dueDate: task.dueDate || "",
//       status: task.status,
//     });
//     setShowTaskModal(true);
//   };

//   const handleSaveTask = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!taskForm.title.trim()) return;

//     const taskData: Task = {
//       id: editingTask?.id || Date.now().toString(),
//       title: taskForm.title.trim(),
//       description: taskForm.description.trim(),
//       priority: taskForm.priority,
//       status: taskForm.status,
//       dueDate: taskForm.dueDate || undefined,
//       createdAt: editingTask?.createdAt || new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     if (editingTask) {
//       dispatch({ type: "UPDATE_TASK", payload: taskData });
//     } else {
//       dispatch({ type: "ADD_TASK", payload: taskData });
//     }

//     setShowTaskModal(false);
//     setEditingTask(null);
//   };

//   const handleDeleteTask = (taskId: string) => {
//     if (window.confirm("Are you sure you want to delete this task?")) {
//       dispatch({ type: "DELETE_TASK", payload: taskId });
//     }
//   };

//   const handleStatusChange = (task: Task, newStatus: Task["status"]) => {
//     const updatedTask = {
//       ...task,
//       status: newStatus,
//       updatedAt: new Date().toISOString(),
//     };
//     dispatch({ type: "UPDATE_TASK", payload: updatedTask });
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
//       case "medium":
//         return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
//       case "low":
//         return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
//       default:
//         return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case "in-progress":
//         return <Clock className="h-5 w-5 text-blue-600" />;
//       case "pending":
//         return <AlertCircle className="h-5 w-5 text-gray-600" />;
//       default:
//         return <AlertCircle className="h-5 w-5 text-gray-600" />;
//     }
//   };

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-200 ${
//         settings.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
//       }`}
//     >
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1
//               className={`text-3xl font-bold mb-2 ${
//                 settings.theme === "dark" ? "text-white" : "text-gray-900"
//               }`}
//             >
//               Tasks
//             </h1>
//             <p
//               className={`text-lg ${
//                 settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
//               }`}
//             >
//               Manage your tasks and stay organized
//             </p>
//           </div>
//           <button
//             onClick={handleCreateTask}
//             className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
//           >
//             <Plus className="h-5 w-5 mr-2" />
//             New Task
//           </button>
//         </div>

//         {/* Filters */}
//         <div
//           className={`rounded-xl p-6 border mb-8 ${
//             settings.theme === "dark"
//               ? "bg-gray-800 border-gray-700"
//               : "bg-white border-gray-200"
//           }`}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search tasks..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${
//                   settings.theme === "dark"
//                     ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
//                     : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
//                 }`}
//               />
//             </div>
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
//                 settings.theme === "dark"
//                   ? "bg-gray-700 border-gray-600 text-white"
//                   : "bg-white border-gray-300 text-gray-900"
//               }`}
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="in-progress">In Progress</option>
//               <option value="completed">Completed</option>
//             </select>
//             <select
//               value={filterPriority}
//               onChange={(e) => setFilterPriority(e.target.value)}
//               className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
//                 settings.theme === "dark"
//                   ? "bg-gray-700 border-gray-600 text-white"
//                   : "bg-white border-gray-300 text-gray-900"
//               }`}
//             >
//               <option value="all">All Priority</option>
//               <option value="high">High</option>
//               <option value="medium">Medium</option>
//               <option value="low">Low</option>
//             </select>
//           </div>
//         </div>

//         {/* Tasks List */}
//         {filteredTasks.length === 0 ? (
//           <div
//             className={`rounded-xl p-12 border text-center ${
//               settings.theme === "dark"
//                 ? "bg-gray-800 border-gray-700"
//                 : "bg-white border-gray-200"
//             }`}
//           >
//             <CheckCircle
//               className={`h-16 w-16 mx-auto mb-4 ${
//                 settings.theme === "dark" ? "text-gray-600" : "text-gray-400"
//               }`}
//             />
//             <h3
//               className={`text-xl font-semibold mb-2 ${
//                 settings.theme === "dark" ? "text-white" : "text-gray-900"
//               }`}
//             >
//               No tasks found
//             </h3>
//             <p
//               className={`mb-6 ${
//                 settings.theme === "dark" ? "text-gray-400" : "text-gray-600"
//               }`}
//             >
//               {tasks.length === 0
//                 ? "Create your first task to get started"
//                 : "Try adjusting your search or filters"}
//             </p>
//             {tasks.length === 0 && (
//               <button
//                 onClick={handleCreateTask}
//                 className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
//               >
//                 Create Your First Task
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredTasks.map((task) => (
//               <div
//                 key={task.id}
//                 className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
//                   settings.theme === "dark"
//                     ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
//                     : "bg-white border-gray-200 hover:shadow-xl"
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-3 mb-2">
//                       {getStatusIcon(task.status)}
//                       <h3
//                         className={`text-lg font-semibold ${
//                           settings.theme === "dark"
//                             ? "text-white"
//                             : "text-gray-900"
//                         }`}
//                       >
//                         {task.title}
//                       </h3>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
//                           task.priority
//                         )}`}
//                       >
//                         {task.priority}
//                       </span>
//                     </div>

//                     {task.description && (
//                       <p
//                         className={`mb-3 ${
//                           settings.theme === "dark"
//                             ? "text-gray-300"
//                             : "text-gray-600"
//                         }`}
//                       >
//                         {task.description}
//                       </p>
//                     )}

//                     <div className="flex items-center space-x-4 text-sm">
//                       <span
//                         className={`${
//                           settings.theme === "dark"
//                             ? "text-gray-400"
//                             : "text-gray-500"
//                         }`}
//                       >
//                         Created: {new Date(task.createdAt).toLocaleDateString()}
//                       </span>
//                       {task.dueDate && (
//                         <span
//                           className={`${
//                             settings.theme === "dark"
//                               ? "text-gray-400"
//                               : "text-gray-500"
//                           }`}
//                         >
//                           Due: {new Date(task.dueDate).toLocaleDateString()}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2 ml-4">
//                     <select
//                       value={task.status}
//                       onChange={(e) =>
//                         handleStatusChange(
//                           task,
//                           e.target.value as Task["status"]
//                         )
//                       }
//                       className={`px-3 py-1 rounded-md border text-sm transition-colors duration-200 ${
//                         settings.theme === "dark"
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-900"
//                       }`}
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="in-progress">In Progress</option>
//                       <option value="completed">Completed</option>
//                     </select>
//                     <button
//                       onClick={() => handleEditTask(task)}
//                       className={`p-2 rounded-md transition-colors duration-200 ${
//                         settings.theme === "dark"
//                           ? "hover:bg-gray-700 text-gray-400 hover:text-white"
//                           : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
//                       }`}
//                     >
//                       <Edit2 className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteTask(task.id)}
//                       className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Task Modal */}
//         {showTaskModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div
//               className={`w-full max-w-md rounded-xl p-6 ${
//                 settings.theme === "dark" ? "bg-gray-800" : "bg-white"
//               }`}
//             >
//               <h2
//                 className={`text-xl font-semibold mb-4 ${
//                   settings.theme === "dark" ? "text-white" : "text-gray-900"
//                 }`}
//               >
//                 {editingTask ? "Edit Task" : "Create New Task"}
//               </h2>

//               <form onSubmit={handleSaveTask} className="space-y-4">
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       settings.theme === "dark"
//                         ? "text-gray-300"
//                         : "text-gray-700"
//                     }`}
//                   >
//                     Title
//                   </label>
//                   <input
//                     type="text"
//                     value={taskForm.title}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, title: e.target.value })
//                     }
//                     className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
//                       settings.theme === "dark"
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-900"
//                     }`}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       settings.theme === "dark"
//                         ? "text-gray-300"
//                         : "text-gray-700"
//                     }`}
//                   >
//                     Description
//                   </label>
//                   <textarea
//                     value={taskForm.description}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, description: e.target.value })
//                     }
//                     rows={3}
//                     className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
//                       settings.theme === "dark"
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-900"
//                     }`}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label
//                       className={`block text-sm font-medium mb-2 ${
//                         settings.theme === "dark"
//                           ? "text-gray-300"
//                           : "text-gray-700"
//                       }`}
//                     >
//                       Priority
//                     </label>
//                     <select
//                       value={taskForm.priority}
//                       onChange={(e) =>
//                         setTaskForm({
//                           ...taskForm,
//                           priority: e.target.value as Task["priority"],
//                         })
//                       }
//                       className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
//                         settings.theme === "dark"
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-900"
//                       }`}
//                     >
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label
//                       className={`block text-sm font-medium mb-2 ${
//                         settings.theme === "dark"
//                           ? "text-gray-300"
//                           : "text-gray-700"
//                       }`}
//                     >
//                       Status
//                     </label>
//                     <select
//                       value={taskForm.status}
//                       onChange={(e) =>
//                         setTaskForm({
//                           ...taskForm,
//                           status: e.target.value as Task["status"],
//                         })
//                       }
//                       className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
//                         settings.theme === "dark"
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-900"
//                       }`}
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="in-progress">In Progress</option>
//                       <option value="completed">Completed</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       settings.theme === "dark"
//                         ? "text-gray-300"
//                         : "text-gray-700"
//                     }`}
//                   >
//                     Due Date (Optional)
//                   </label>
//                   <input
//                     type="date"
//                     value={taskForm.dueDate}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, dueDate: e.target.value })
//                     }
//                     className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
//                       settings.theme === "dark"
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-900"
//                     }`}
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setShowTaskModal(false)}
//                     className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
//                       settings.theme === "dark"
//                         ? "border-gray-600 text-gray-300 hover:bg-gray-700"
//                         : "border-gray-300 text-gray-700 hover:bg-gray-50"
//                     }`}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
//                   >
//                     {editingTask ? "Update Task" : "Create Task"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
