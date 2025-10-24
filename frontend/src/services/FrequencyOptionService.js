export class FrequencyOptionService {
  constructor() {
    this.baseUrl = "/api/frequency-options"; // Adjust if your API base URL is different
  }

  async getFrequencyOptions() {
    try {
      const response = await fetch(this.baseUrl);
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
