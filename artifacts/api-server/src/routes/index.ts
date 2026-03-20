import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import itemsRouter from "./items";
import journalRouter from "./journal";
import questsRouter from "./quests";
import partiesRouter from "./parties";
import dmRouter from "./dm";
import assetsRouter from "./assets";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/characters", charactersRouter);
router.use("/characters/:characterId/items", itemsRouter);
router.use("/characters/:characterId/journal", journalRouter);
router.use("/parties", partiesRouter);
router.use("/parties/:partyId/quests", questsRouter);
router.use("/dm", dmRouter);
router.use("/assets", assetsRouter);

export default router;
