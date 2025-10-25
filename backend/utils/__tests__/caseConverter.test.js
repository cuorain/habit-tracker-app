import { camelToSnakeCase } from "../caseConverter";

describe("camelToSnakeCase", () => {
  test("キーをキャメルケースからスネークケースに変換することを確認する", () => {
    const obj = {
      firstName: "John",
      lastName: "Doe",
      emailAddress: "john.doe@example.com",
    };
    const expected = {
      first_name: "John",
      last_name: "Doe",
      email_address: "john.doe@example.com",
    };
    expect(camelToSnakeCase(obj)).toEqual(expected);
  });

  test("ネストされたキーをキャメルケースからスネークケースに変換することを確認する", () => {
    const obj = {
      userData: {
        firstName: "Jane",
        dateOfBirth: "2000-01-01",
      },
      createdAt: "2023-01-01T00:00:00Z",
    };
    const expected = {
      user_data: {
        first_name: "Jane",
        date_of_birth: "2000-01-01",
      },
      created_at: "2023-01-01T00:00:00Z",
    };
    expect(camelToSnakeCase(obj)).toEqual(expected);
  });

  test("配列のオブジェクトのキーをキャメルケースからスネークケースに変換することを確認する", () => {
    const arr = [
      { habitName: "Running", targetValue: 10 },
      { habitType: "BOOLEAN", userId: 123 },
    ];
    const expected = [
      { habit_name: "Running", target_value: 10 },
      { habit_type: "BOOLEAN", user_id: 123 },
    ];
    expect(camelToSnakeCase(arr)).toEqual(expected);
  });

  test("混合ケースとすでにスネークケースのキーを正しく処理することを確認する", () => {
    const obj = {
      userName: "Alice",
      email_address: "alice@example.com", // Already snake_case
      someId: 1,
    };
    const expected = {
      user_name: "Alice",
      email_address: "alice@example.com",
      some_id: 1,
    };
    expect(camelToSnakeCase(obj)).toEqual(expected);
  });

  test("空のオブジェクトの場合、空のオブジェクトを返すことを確認する", () => {
    const obj = {};
    const expected = {};
    expect(camelToSnakeCase(obj)).toEqual(expected);
  });

  test("オブジェクトでない場合、何も変更しないことを確認する", () => {
    expect(camelToSnakeCase("testString")).toBe("testString");
    expect(camelToSnakeCase(123)).toBe(123);
    expect(camelToSnakeCase(true)).toBe(true);
    expect(camelToSnakeCase(null)).toBe(null);
    expect(camelToSnakeCase(undefined)).toBe(undefined);
  });
});
