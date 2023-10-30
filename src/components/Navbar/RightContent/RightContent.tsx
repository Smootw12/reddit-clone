import { Button, Flex, Menu, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import AuthModal from "../../Modal/Auth/AuthModal";
import AuthButtons from "./AuthButtons";
import { auth } from "../../../firebase/clientApp";
import { signOut, User } from "firebase/auth";
import Icons from "./Icons";
import UserMenu from "./UserMenu";

type RightContentProps = {
  user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({ user }) => {
  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <>
      <AuthModal />
      <Flex align={"center"}>
        {user ? <Icons /> : <AuthButtons />}
        <UserMenu user={user} />
      </Flex>
    </>
  );
};
export default RightContent;
