import express, { Express, Request, Response } from "express"
// import dotenv from "dotenv"

import fs from "fs"
import yaml from "yaml"
import path from "path"
import cors from "cors"
import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node"
import { z } from "zod"

const app = express()
const port = process.env.PORT || 4001
app.use(express.json())
app.use(cors())

const kubeconfig = new KubeConfig()
kubeconfig.loadFromDefault()
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api)
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api)
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api)

// Updated utility function to handle multi-document YAML files
const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
    let docString = doc.toString()
    const regex = new RegExp(`service_name`, "g")
    docString = docString.replace(regex, replId)
    console.log(docString)
    return yaml.parse(docString)
  })
  return docs
}

app.post("/start", async (req, res) => {
  const initSchema = z.object({
    userId: z.string(),
    sandboxId: z.string(),
  })
  const { userId, sandboxId } = initSchema.parse(req.body)
  const namespace = "default"

  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../service.yaml"),
      sandboxId
    )
    kubeManifests.forEach(async (manifest) => {
      if (manifest.kind === "Deployment")
        await appsV1Api.createNamespacedDeployment(namespace, manifest)
      else if (manifest.kind === "Service")
        await coreV1Api.createNamespacedService(namespace, manifest)
      else if (manifest.kind === "Ingress")
        await networkingV1Api.createNamespacedIngress(namespace, manifest)
    })
    res.status(200).send({ message: "Resources created." })
  } catch (error) {
    console.log("Failed to create resources", error)
    res.status(500).send({ message: "Failed to create resources." })
  }
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})