export type CreateTranscriptInput = {
  contentId: string;
  text: string;
  language?: string;
};

export type SarvamBatchJob = {
  job_id: string;
  job_state: string;
};

export type SarvamUploadResponse = {
  job_id: string;
  upload_urls: Record<
    string,
    {
      file_url: string;
    }
  >;
};