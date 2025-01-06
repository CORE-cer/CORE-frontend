import { Box } from "@mui/material";
import { DRAWER_WIDTH } from "../MUIThemes";

const Main = ({ permanentDrawer, children, sx }) => {
  return (
    <Box
      sx={{
        ...sx,
        display: "flex",
        ml: permanentDrawer ? `${DRAWER_WIDTH}px` : 0,
        flexGrow: 1,
        overflow: "hidden",
        // 48px is the dense's toolbar height
        height: `calc(100vh - 48px)`,
      }}
    >
      {children}
    </Box>
  );
};

export default Main;
