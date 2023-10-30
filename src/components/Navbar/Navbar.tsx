import { Flex, Img } from "@chakra-ui/react";
import React from "react";
import RightContent from "./RightContent/RightContent";
import SearchInput from "./SearchInput";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/clientApp";
import Directory from "./Directory/Directory";
import useCommunityData from "../../hooks/useCommunityData";
import { useRouter } from "next/router";
import useDirectory from "../../hooks/useDirectory";
import { defaultMenuItem } from "../../atoms/directoryMenuAtom";

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  useCommunityData();

  const { onSelectMenuItem } = useDirectory();

  const router = useRouter();

  function handleBackToMenu() {
    onSelectMenuItem(defaultMenuItem);
    router.push(`/`);
  }

  return (
    <div>
      <Flex
        h="47px"
        padding="6px 18px"
        bg="white"
        justifyContent="space-between"
        align={"center"}
      >
        <Flex align="center" cursor="pointer" onClick={handleBackToMenu}>
          <Img src="/images/redditFace.svg" w="32px" />
          <Img
            src="/images/redditText.svg"
            w="76px"
            display={{ base: "none", md: "unset" }}
          />
        </Flex>

        {user && <Directory />}
        <SearchInput user={user} />
        <RightContent user={user} />
      </Flex>
    </div>
  );
};
export default Navbar;
