import { Response, Request } from "express";
import { grabLogo, setLogo } from "../logoStore";
import { getLogo } from "../twitch";

export const setLogoRoute = (app: any) =>
  app.get("/logos/:name", async (req: Request, res: Response) => {
    // render the index template
    const username = req.params.name;

    let logo: any = grabLogo(username);

    if (!logo) {
      logo = await getLogo(username);
      setLogo(username, logo);
    }

    res.send(JSON.stringify({ logo }));
  });
