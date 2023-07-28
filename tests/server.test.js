const request = require("supertest");
const { app, server, metrics } = require("../server");
const axios = require("axios");
const preTestMetrics = JSON.parse(JSON.stringify(metrics));

afterAll((done) => {
  server.close(done);
});

describe("GET /deals", () => {
  it("deals should be returned", async () => {
    const response = await request(app).get("/deals");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(metrics.GET.length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('if success but no deals, return should be json message "no deals were found"', async () => {
    jest.spyOn(axios, "get").mockResolvedValue({ data: { data: [] } });

    const response = await request(app).get("/deals");

    expect(response.status).toBe(200);
    expect(response.body).toBe("No deals were found");
  });

  it("should handle errors when retrieving deals", async () => {
    jest
      .spyOn(axios, "get")
      .mockRejectedValue(new Error("Error requesting the API"));

    const response = await request(app).get("/deals");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Error occurred when requesting Pipedrive API",
      message: "Error requesting the API",
    });
  });
});

// POST endpoint tests
describe("POST /deals", () => {
    it("should create a new deal successfully", async () => {
    const testData = {
        title: "Testdeal2",
        value: 100,
        currency: "USD",
        status: "open",
      };
    const response = await request(app).post("/deals").send(testData);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("id");
  }); 

  it("should return an error for an invalid payload", async () => {
    const errorData = {
      errorField: "This is a non existing field for the POST endpoint",
    };
    const response = await request(app).post("/deals").send(errorData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(metrics.POST.length).toBeGreaterThanOrEqual(0);
  });

  it("pipedrive API return error if wrong data type provided", async () => {
    // value field takes string, provide an object instead
    const errorData = {
      title: "Test Deal",
      value: { val: "Hello" },
      currency: "USD",
      status: "open",
    };
    const response = await request(app).post("/deals").send(errorData);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(metrics.POST.length).toBeGreaterThan(0);
  });
});

// POST endpoint tests
describe("PUT /deals", () => {
  const testData = {
    title: "Second deal title new",
  };
  var idToUpdate = 2
  // update test
  it("should pdate a deal successfully", async () => {
    const response = await request(app).put("/deals").query({ id: idToUpdate }).send(testData);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.id).toBe(idToUpdate);
    expect(response.body.data.title).toBe(testData.title);
  });

  it("should return an error if id is missing", async () => {
    // No id is present for the PUT request
    const errorData = {
      title: "New Name is french fries",
      value: 100,
      currency: "USD",
      status: "open",
    };
    const response = await request(app).put("/deals").send(errorData);
    expect(response.status).toBe(400);
    expect(response.body).toBe("No deal id provided in body.");
    expect(metrics.PUT.length).toBeGreaterThan(0);
  });

  // error testing the put method
  it("should handle errors when updating deals", async () => {
    jest
      .spyOn(axios, "put")
      .mockRejectedValue(new Error("Error updating the deal"));

    const response = await request(app).put("/deals").query({id: idToUpdate}).send(testData);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Error occurred when requesting Pipedrive API",
      message: "Error updating the deal",
    });
  });
});


// check if the metrics object has changed over the course of the tests
describe("GET /metrics", () => {
  it("should return request metrics", async () => {
    const response = await request(app).get("/metrics");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(preTestMetrics).not.toEqual(metrics);
  });
});
