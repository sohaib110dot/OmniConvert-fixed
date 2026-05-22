import { Upload, ConversionJob, getDBStatus } from "./db.ts";

// In-memory fallbacks
const mockUploads = new Map<string, any>();
const mockJobs = new Map<string, any>();

export const repo = {
  async createUpload(data: any) {
    const status = getDBStatus();
    if (status.isConnected) {
      try {
        return await Upload.create(data);
      } catch (err) {
        console.error("DB Create Upload failed, falling back to memory:", err);
      }
    }
    const id = Math.random().toString(36).substring(7);
    const doc = { _id: id, ...data };
    mockUploads.set(id, doc);
    return doc;
  },

  async findUploadById(id: string) {
    const status = getDBStatus();
    if (status.isConnected) {
      try {
        const doc = await (Upload as any).findById(id);
        if (doc) return doc;
      } catch (err) {
        console.error("DB Find Upload failed, trying memory:", err);
      }
    }
    return mockUploads.get(id);
  },

  async createJob(data: any) {
    const status = getDBStatus();
    if (status.isConnected) {
      try {
        return await (ConversionJob as any).create(data);
      } catch (err) {
        console.error("DB Create Job failed, falling back to memory:", err);
      }
    }
    const id = Math.random().toString(36).substring(7);
    const doc = { _id: id, ...data, createdAt: new Date() };
    mockJobs.set(id, doc);
    return doc;
  },

  async findJobById(id: string) {
    const status = getDBStatus();
    if (status.isConnected) {
      try {
        const doc = await (ConversionJob as any).findById(id).populate("uploadId");
        if (doc) return doc;
      } catch (err) {
        console.error("DB Find Job failed, trying memory:", err);
      }
    }
    const job = mockJobs.get(id);
    if (job && typeof job.uploadId === "string") {
      job.uploadId = await this.findUploadById(job.uploadId);
    }
    return job;
  },

  async updateJob(id: string, data: any) {
    const status = getDBStatus();
    if (status.isConnected) {
      try {
        const doc = await (ConversionJob as any).findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
        if (doc) return doc;
      } catch (err) {
        console.error("DB Update Job failed, trying memory:", err);
      }
    }
    const existing = mockJobs.get(id);
    if (existing) {
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockJobs.set(id, updated);
      return updated;
    }
    return null;
  }
};
