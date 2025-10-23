import { convertKeysToSnakeCase } from "../caseConverterMiddleware";
import { jest } from "@jest/globals";

describe("convertKeysToSnakeCase middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  test("req.bodyのキーをキャメルケースからスネークケースに変換することを確認する", () => {
    mockReq.body = {
      habitName: "Read Book",
      habitType: "BOOLEAN",
      targetValue: 10,
      targetUnit: "minutes",
    };

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual({
      habit_name: "Read Book",
      habit_type: "BOOLEAN",
      target_value: 10,
      target_unit: "minutes",
    });
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("req.bodyがネストされたオブジェクトの場合、キーをキャメルケースからスネークケースに変換することを確認する", () => {
    mockReq.body = {
      userData: {
        firstName: "John",
        lastName: "Doe",
      },
      createdAt: "2023-01-01",
    };

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual({
      user_data: {
        first_name: "John",
        last_name: "Doe",
      },
      created_at: "2023-01-01",
    });
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("req.bodyが空の場合、何も変更しないことを確認する", () => {
    mockReq.body = {};

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual({});
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("req.bodyが存在しない場合、何も変更しないことを確認する", () => {
    delete mockReq.body;

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toBeUndefined();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("req.bodyがオブジェクトでない場合、何も変更しないことを確認する", () => {
    mockReq.body = "some string";

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual("some string");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("req.bodyが配列のオブジェクトの場合、キーをキャメルケースからスネークケースに変換することを確認する", () => {
    mockReq.body = [
      { habitName: "Read", targetValue: 30 },
      { habitType: "NUMERIC_COUNT", userId: 1 },
    ];

    convertKeysToSnakeCase(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual([
      { habit_name: "Read", target_value: 30 },
      { habit_type: "NUMERIC_COUNT", user_id: 1 },
    ]);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
