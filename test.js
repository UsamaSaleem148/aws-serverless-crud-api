import { handler } from "./index.js";

const printResponse = (testName, response) => {
  console.log(`\n========== ${testName} ==========`);
  console.log("Status:", response.statusCode);
  console.log("Body:", response.body);
};

// 1. GET all users
const getAllUsers = async () => {
  const event = {
    requestContext: {
      http: {
        method: "GET",
      },
    },
  };

  const response = await handler(event);

  printResponse("GET ALL USERS", response);
};

// 2. GET user by name
const getUserByName = async (userName) => {
  const event = {
    requestContext: {
      http: {
        method: "GET",
      },
    },
    pathParameters: {
      userName,
    },
  };

  const response = await handler(event);

  printResponse(`GET USER: ${userName}`, response);
};

// 3. POST new user
const createUser = async (user) => {
  const event = {
    requestContext: {
      http: {
        method: "POST",
      },
    },
    body: JSON.stringify(user),
  };

  const response = await handler(event);

  printResponse(`CREATE USER: ${user.name}`, response);
};

// 4. PUT existing user
const updateUser = async (userName, user) => {
  const event = {
    requestContext: {
      http: {
        method: "PUT",
      },
    },
    pathParameters: {
      userName,
    },
    body: JSON.stringify(user),
  };

  const response = await handler(event);

  printResponse(`UPDATE USER: ${userName}`, response);
};

// 5. DELETE user
const deleteUser = async (userName) => {
  const event = {
    requestContext: {
      http: {
        method: "DELETE",
      },
    },
    pathParameters: {
      userName,
    },
  };

  const response = await handler(event);

  printResponse(`DELETE USER: ${userName}`, response);
};

// Run tests
const runTests = async () => {
  await getAllUsers();

  await getUserByName("Usama");

  await createUser({
    name: "Ali",
    email: "ali@gmail.com",
    followers: 25,
  });

  await getUserByName("Ali");

  await updateUser("Ali", {
    email: "ali.updated@gmail.com",
    followers: 100,
  });

  await getUserByName("Ali");

  await deleteUser("Ali");

  await getUserByName("Ali");
};

runTests().catch((error) => {
  console.error("Test execution failed:", error);
});
