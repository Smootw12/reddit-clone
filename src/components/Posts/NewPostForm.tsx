import { Alert, AlertIcon, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import TabItem from "./TabItem";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { Post } from "../../atoms/postsAtom";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase/clientApp";
import { uploadString, ref, getDownloadURL } from "firebase/storage";
import useSelectFile from "../../hooks/useSelectFile";

type Props = {
  user: User;
  communityImageURL?: string;
};

const formTabs = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
];

function NewPostForm({ user, communityImageURL }: Props) {
  const router = useRouter();

  const { onSelectImage, selectedFile, setSelectedFile } = useSelectFile();

  const [selected, setSelected] = useState(formTabs[0].title);

  const [loading, setLoading] = useState(false);

  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });

  const [error, setError] = useState(false);

  async function handleCreatePost() {
    setLoading(true);
    const { communityId } = router.query;
    const newPost: Post = {
      communityId: communityId as string,
      communityImageURL: communityImageURL || "",
      creatorId: user.uid,
      creatorDisplayName: user.email!.split("@")[0],
      title: textInputs.title,
      body: textInputs.body,
      numberOfComments: 0,
      voteStatus: 0,
      createdAt: serverTimestamp() as Timestamp,
    };

    try {
      const postDocRef = await addDoc(collection(firestore, "posts"), newPost);
      if (selectedFile) {
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(postDocRef, { imageURL: downloadURL });
      }
    } catch (error) {
      console.log("createPost error", error);
      setError(true);
    }
    setLoading(false);
    router.back();
  }

  function onTextChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <Flex direction="column" bg="white" borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          <TabItem
            TabItem={item}
            selected={selected === item.title}
            setSelectedTab={() => setSelected(item.title)}
            key={item.title}
          />
        ))}
      </Flex>
      <Flex>
        {selected === "Post" && (
          <TextInputs
            handleCreatePost={handleCreatePost}
            loading={loading}
            onChange={onTextChange}
            textInputs={textInputs}
          />
        )}
        {selected === "Images & Video" && (
          <ImageUpload
            setSelectedFile={setSelectedFile}
            onSelectImage={onSelectImage}
            setSelected={setSelected}
            selectedFile={selectedFile}
          />
        )}
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2}>Error creating post</Text>
        </Alert>
      )}
    </Flex>
  );
}

export default NewPostForm;
