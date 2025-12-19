const taskService = require("../src/services/task.service");
const taskRepository = require("../src/repositories/task.repository");
const { notifyUser, broadcastUpdate } = require("../src/utils/socket.util");

// We mock these modules so we don't need a real DB or a running Socket server
jest.mock("../src/repositories/task.repository");
jest.mock("../src/utils/socket.util");

describe("TaskService Unit Tests", () => {
    
    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean slate
        jest.clearAllMocks();
    });

    // Test 1: Creating a task
    test("createNewTask should save task and broadcast to everyone", async () => {
        const mockData = { todo: "Buy Milk", priority: "High" };
        const userId = "user123";
        const savedTask = { ...mockData, _id: "task999", userID: userId };

        taskRepository.create.mockResolvedValue(savedTask);

        const result = await taskService.createNewTask(mockData, userId);

        expect(result._id).toBe("task999");
        expect(taskRepository.create).toHaveBeenCalled();
        // Check if we told everyone about the new task
        expect(broadcastUpdate).toHaveBeenCalledWith('TASK_CREATED', savedTask);
    });

    // Test 2: Assigning a task (The Collaboration Feature)
    test("assignTask should update DB and notify only the target user", async () => {
        const taskId = "task1";
        const targetUserId = "user456";
        const updatedTask = { _id: taskId, title: "Fix Bug", assignedTo: targetUserId };

        taskRepository.update.mockResolvedValue(updatedTask);

        await taskService.assignTask(taskId, targetUserId);

        expect(taskRepository.update).toHaveBeenCalledWith(taskId, { assignedTo: targetUserId });
        // Verify private notification was sent to user456
        expect(notifyUser).toHaveBeenCalledWith(
            targetUserId, 
            'TASK_ASSIGNED', 
            expect.objectContaining({ taskId: taskId })
        );
    });

    // Test 3: Error Handling
    test("removeTask should throw error if task does not exist", async () => {
        // Simulate "0 rows deleted" from database
        taskRepository.delete.mockResolvedValue({ deletedCount: 0 });

        await expect(taskService.removeTask("fakeId", "user123"))
            .rejects
            .toThrow("Task not found or unauthorized");
    });
});