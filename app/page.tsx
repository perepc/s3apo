'use client'
import { useState, ChangeEvent, FormEvent } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AWS_REGIONS = [
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-2', label: 'Europe (London)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'eu-north-1', label: 'Europe (Stockholm)' },
  { value: 'eu-south-1', label: 'Europe (Milan)' },
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'ca-central-1', label: 'Canada (Central)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
  { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
  { value: 'af-south-1', label: 'Africa (Cape Town)' },
  { value: 'me-south-1', label: 'Middle East (Bahrain)' }
];

type UploadStatus = {
  message: string;
  url?: string;
  isError?: boolean;
  progress?: number;
  fileName: string;
};

export default function Home() {
  const [credentials, setCredentials] = useState({
    accessKey: '',
    secretKey: '',
    bucketName: '',
    region: 'eu-west-1'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleCredentialsChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadStatus([]);

    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey
      }
    });

    try {
      for (const file of files) {
        setUploadStatus(prev => [...prev, { 
          message: `Uploading ${file.name}...`,
          fileName: file.name,
          progress: 0
        }]);
        
        const fileBuffer = await file.arrayBuffer();
        const totalSize = fileBuffer.byteLength;
        let uploadedSize = 0;

        const command = new PutObjectCommand({
          Bucket: credentials.bucketName,
          Key: file.name,
          Body: Buffer.from(fileBuffer),
          ACL: 'public-read',
          ContentType: file.type
        });

        await s3Client.send(command);
        
        const fileUrl = `https://${credentials.bucketName}.s3.${credentials.region}.amazonaws.com/${file.name}`;
        setUploadStatus(prev => [
          ...prev.filter(status => status.fileName !== file.name),
          { 
            message: `${file.name} uploaded successfully`,
            fileName: file.name,
            url: fileUrl,
            progress: 100
          }
        ]);
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setUploadStatus(prev => [...prev, { 
        message: `Error: ${error.message || JSON.stringify(error)}`,
        isError: true,
        fileName: 'error'
      }]);
    }

    setUploading(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <img 
          src="/sapo.png" 
          alt="Application header"
          className="w-auto h-auto rounded-lg shadow-lg mb-8"
        />
        <h1 className="text-2xl font-bold mb-6">Upload files to AWS S3 As Public Objects (s3apo)</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Access Key:</label>
            <input
              type="text"
              name="accessKey"
              value={credentials.accessKey}
              onChange={handleCredentialsChange}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Secret Key:</label>
            <input
              type="password"
              name="secretKey"
              value={credentials.secretKey}
              onChange={handleCredentialsChange}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Bucket Name:</label>
            <input
              type="text"
              name="bucketName"
              value={credentials.bucketName}
              onChange={handleCredentialsChange}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Region:</label>
            <select
              name="region"
              value={credentials.region}
              onChange={handleCredentialsChange}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            >
              {AWS_REGIONS.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label} ({region.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Select files:</label>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-6
                ${isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-blue-500'
                }
                transition-colors duration-200
              `}
            >
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  {files.length > 0 
                    ? `${files.length} file(s) selected` 
                    : 'Drag and drop files here or click to select'}
                </div>
                {files.length > 0 && (
                  <ul className="text-sm text-gray-500 space-y-1">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload files'}
            </button>
          </div>
        </form>

        {uploadStatus.length > 0 && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Upload Status:</h2>
              <ul className="space-y-2">
                {uploadStatus.map((status, index) => (
                  <li 
                    key={status.fileName} 
                    className={`p-2 rounded border ${
                      status.isError 
                        ? 'bg-red-900/50 border-red-700 text-red-400'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span>{status.message}</span>
                      {typeof status.progress === 'number' && !status.isError && (
                        <span className="text-sm">{status.progress}%</span>
                      )}
                    </div>
                    
                    {typeof status.progress === 'number' && !status.isError && (
                      <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {status.url && (
                      <a 
                        href={status.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all text-sm mt-1 block"
                      >
                        {status.url}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
