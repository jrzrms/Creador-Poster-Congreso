import { PosterData } from "./types";

export const parseAbstract = async (abstractText: string): Promise<PosterData> => {
  const response = await fetch("/api/parse-abstract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ abstractText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};
