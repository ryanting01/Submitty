<?php

namespace app\controllers;

use app\libraries\Core;
use app\libraries\FileUtils;
use app\exceptions\CurlException;
use app\libraries\response\MultiResponse;
use app\libraries\response\WebResponse;
use app\libraries\routers\AccessControl;
use app\libraries\response\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class DockerInterfaceController
 *
 * Works with Docker to provide a user inteface
 *
 */
class DockerInterfaceController extends AbstractController {

    /**
     * @Route("/admin/docker", methods={"GET"})
     * @Route("/api/docker", methods={"GET"})
     * @return MultiResponse
     */
    public function showDockerInterface(): MultiResponse {
        $user = $this->core->getUser();
        if (is_null($user) || !$user->accessFaculty()) {
            return new MultiResponse(
                JsonResponse::getFailResponse("You don't have access to this endpoint."),
                new WebResponse("Error", "errorPage", "You don't have access to this page.")
            );
        }

        try {
            $response = $this->core->curlRequest(
                FileUtils::joinPaths($this->core->getConfig()->getCgiUrl(), "docker_ui.cgi")
            );
        }
        catch (CurlException $exc) {
            $msg = "Failed to get response from CGI process, please try again";
            return new MultiResponse(
                JsonResponse::getFailResponse($msg),
                new WebResponse("Error", "errorPage", $msg)
            );
        }
        $json = json_decode($response, true);

        if ($json['success'] === false) {
            return new MultiResponse(
                JsonResponse::getFailResponse($json['error']),
                new WebResponse("Error", "errorPage", $json['error'])
            );
        }

        $json['autograding_containers'] = FileUtils::readJsonFile(
            FileUtils::joinPaths(
                $this->core->getConfig()->getSubmittyInstallPath(),
                "config",
                "autograding_containers.json"
            )
        );
        
        $json['autograding_workers'] = FileUtils::readJsonFile(
            FileUtils::joinPaths(
                $this->core->getConfig()->getSubmittyInstallPath(),
                "config",
                "autograding_workers.json"
            )
        );
        return new MultiResponse(
            JsonResponse::getSuccessResponse($json),
            new WebResponse(
                ['admin', 'Docker'],
                'displayDockerPage',
                $json
            )
        );
    }
    /**
     * @Route("/admin/add_image", methods={"POST"})
     * @return JsonResponse
     */
    public function addImage(): JsonResponse {
        $user = $this->core->getUser();
        if (is_null($user) || !$user->accessFaculty()) {
            return new MultiResponse(
                JsonResponse::getFailResponse("You don't have access to this endpoint."),
                new WebResponse("Error", "errorPage", "You don't have access to this page.")
            );
        }
        
        if (!isset($_POST['image'])) {
            $this->core->addErrorMessage("Image not set");
            return JsonReponse::getErrorResponse("Image not set");
        }
        if (!isset($_POST['capability'])) {
            $this->core->addErrorMessage("Capability not set");
            return JsonReponse::getErrorResponse("Capability not set");
        }

        // check for proper format
        $match = preg_match('/^([a-z0-9]+\/)+[a-z0-9]+:[a-zA-Z0-9]+[a-zA-Z0-9._-]*$/', $_POST['image']);
        if ($match == 0) {
            $this->core->addErrorMessage("Improper docker image name");
            return JsonReponse::getErrorResponse("Improper docker image name");
        }
        $image_arr = explode(":", $_POST['image']);
        // ping the dockerhub API to check if docker exists
        $url = "https://registry.hub.docker.com/v1/repositories/".$image_arr[0]."/tags";
        $tag = $image_arr[1];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $return_str = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $code_success = !$http_code == 200;
        if (curl_errno($ch) || $http_code !== 200) {
            $this->core->addErrorMessage("Error: Repository not found on dockerhub.");
            return JsonResponse::getErrorResponse($image_arr[0] . ' not found on DockerHub');
        }
        $return_json = json_decode($return_str);
        $found = FALSE;

        foreach ($return_json as $image) {
            if ($image->name == $tag) {
                $found = TRUE;
            }
        }
        
        if ($found) {
            $this->core->addSuccessMessage("Image found on dockerhub!\n" . $_POST['image'] . " queued to be added.");
            return JsonResponse::getSuccessResponse($_POST['image'] . ' found on DockerHub');
        }
        else {
            $this->core->addErrorMessage("Error: Image not found on dockerhub.");
            return JsonResponse::getFailResponse($_POST['image'] . ' not found on DockerHub');
        }
        
    }
}
