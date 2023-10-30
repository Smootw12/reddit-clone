import React, { useState } from "react";

function useSelectFile() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  function onSelectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target?.result as string);
    };
  }
  return { onSelectImage, selectedFile, setSelectedFile };
}

export default useSelectFile;
