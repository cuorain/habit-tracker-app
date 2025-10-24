export class FrequencyOptionService {
  constructor() {
    this.apiUrl = process.env.VITE_API_URL || "http://localhost:8080";
  }

  async fetchFrequencyOptions() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/frequency-options`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching frequency options:", error);
      throw error;
    }
  }
}
