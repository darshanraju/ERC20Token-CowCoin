import { makeStyles } from "@material-ui/core";
import React from "react";

const CoinStats = () => {
  const classes = useStyles();
  return (
    <div className={classes.statsContainer}>
      <div className={classes.stat}>
        <div className={classes.title}>Price</div>
        <div className={classes.subTitle}>1 Moo = 0.001 Eth</div>
      </div>
      <div className={classes.stat}>
        <div className={classes.title}>Market Cap</div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  statsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontWeight: "bold" },
  subTitle: {},
}));
export default CoinStats;
