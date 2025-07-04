"use client";
import { useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import { ErrorDiv } from "./compLibrary";

const ImageUploadDiv = ({
  publicUrl,
  onUpload
}: {
  publicUrl: string;
  onUpload: (uploaded: boolean, publicUrl: string, imageFile: File, imageName: string, imageType: string) => void;
}) => {
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const [localPublicUrl, setLocalPublicUrl] = useState(publicUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileChange = (e: FileChangeEvent) => {
    const file: File | undefined = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const localUrl = URL.createObjectURL(file);
      setLocalPublicUrl(localUrl);
      onUpload(true, localPublicUrl, file, file.name, file.type);
    }
  };
  return (
    <div className="flex flex-col gap-5 justify-center items-center w-[30%]">
      <div className="bg-foregroundColor-50 h-[200px] w-[200px] rounded-full flex text-backgroundColor text-[60px] font-bold items-center justify-center">
        {!localPublicUrl ? (
          <div>IM</div>
        ) : (
          <div
            className="w-full h-full rounded-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${localPublicUrl})`
            }}
          ></div>
        )}
      </div>
      <input type="file" accept="image/png, image/jpeg" className="hidden" ref={inputRef} onChange={handleFileChange} />
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="flex items-center justify-between gap-3 text-foregroundColor hover:text-foregroundColor-70 cursor-pointer"
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <IoCloudUploadOutline className=" text-[20px]" />
          <span>{!localPublicUrl ? "Upload" : "Update"} Image</span>
        </div>
        {imageName && (
          <div className="flex items-center justify-between gap-3">
            {imageName.slice(0, 25)}
            <IoClose
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                setImageName("");
                setLocalPublicUrl("");
              }}
              className="hover:cursor-pointer hover:text-red-500 text-[18px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadDiv;
