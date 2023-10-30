import { Button, Flex, Image, Stack } from "@chakra-ui/react";
import React, { useRef } from "react";

type Props = {
  selectedFile?: string;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelected: (value: string) => void;
  setSelectedFile: (value: string) => void;
};

function ImageUpload({
  selectedFile,
  onSelectImage,
  setSelected,
  setSelectedFile,
}: Props) {
  const selectedFileRef = useRef<HTMLInputElement>(null);
  return (
    <Flex direction="column" justify="center" align="center" width="100%">
      {selectedFile ? (
        <>
          <Image src={selectedFile} maxW="400px" maxH="400px" mt={4} />
          <Stack direction="row" mt={4}>
            <Button height="28px" onClick={() => setSelected("Post")} mb={4}>
              Back to Post
            </Button>
            <Button
              variant="outline"
              height="28px"
              onClick={() => setSelectedFile("")}
            >
              Remove
            </Button>
          </Stack>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          marginY={5}
          border="1px dashed"
          borderColor="gray.200"
          height="240px"
          width="95%"
          borderRadius={4}
        >
          <Button
            variant="outline"
            height="28px"
            onClick={() => selectedFileRef.current?.click()}
          >
            Upload
          </Button>
          <input
            type="file"
            accept="image/x-png,image/gif,image/jpeg"
            ref={selectedFileRef}
            hidden
            onChange={onSelectImage}
          />
        </Flex>
      )}
    </Flex>
  );
}

export default ImageUpload;
