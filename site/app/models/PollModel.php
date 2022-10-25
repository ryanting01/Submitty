<?php

namespace app\models;

use app\libraries\Core;

/**
 *
 * Class PollModel
 *
 * @method int getId()
 * @method string getName()
 * @method string getQuestion()
 * @method string getQuestionType()
 * @method int getNumResponses()
 * @method string|null getImagePath()
 */
class PollModel extends AbstractModel {
    /** @prop-read int */
    protected $id;
    /** @prop-read string */
    protected $name;
    /** @prop-read string */
    protected $question;
    /** @prop-read string */
    protected $question_type;
    protected $responses;
    /** @prop-read int */
    protected $num_responses;
    /** @prop-read array */
    protected $answers;
    /** @prop-read array */
    protected $user_responses;
    protected $release_date;
    protected $status;
    /** @prop-read string|null */
    protected $image_path;
    /** @prop-read string */
    protected $release_histogram;

    public function __construct(
        Core $core,
        int $id,
        string $name,
        string $question,
        string $question_type,
        string $status,
        string $release_date,
        ?string $image_path,
        string $release_histogram,
        int $num_responses,
        ?array $answers = null,
        ?array $responses = null,
        ?array $user_responses = null
    ) {
        parent::__construct($core);
        $this->id = $id;
        $this->name = $name;
        $this->question = $question;
        $this->question_type = $question_type;
        $this->status = $status;
        $this->release_date = $release_date;
        $this->image_path = $image_path;
        $this->release_histogram = $release_histogram;
        $this->num_responses = $num_responses;
        $this->answers = $answers;
        $this->responses = $responses;
        $this->user_responses = $user_responses;
    }

    public function getResponses() {
        // If this is the first time the responses have been queried, make a DB query.  Otherwise use the existing data.
        if ($this->responses === null) {
            $this->responses = $this->core->getQueries()->getResponses($this->getId());
        }
        return array_keys($this->responses);
    }

    public function getAnswers() {
        // If this is the first time the answers have been queried, make a DB query.  Otherwise use the existing data.
        if ($this->answers === null) {
            $this->answers = $this->core->getQueries()->getAnswers($this->getId());
        }
        return $this->answers;
    }

    public function isOpen() {
        return $this->status == "open";
    }

    public function isClosed() {
        return $this->status == "closed";
    }

    public function isEnded() {
        return $this->status == "ended";
    }

    public function getUserResponses() {
        // Only fetch the responses if they are needed, and cache the result
        if ($this->user_responses === null) {
            $this->user_responses = $this->core->getQueries()->getUserResponses($this->id);
        }
        return $this->user_responses;
    }

    public function getUserResponse($user_id) {
        if ($this->user_responses === null) {
            $this->user_responses = $this->core->getQueries()->getUserResponses($this->id);
        }
        if (!isset($this->user_responses[$user_id]) || count($this->user_responses[$user_id]) === 0) {
            return null;
        }

        return $this->user_responses[$user_id];
    }

    public function getResponseString($response_id): string {
        // If this is the first time the responses have been queried, make a DB query.  Otherwise use the existing data.
        if ($this->responses === null) {
            $this->responses = $this->core->getQueries()->getResponses($this->getId());
        }
        foreach ($this->responses as $r) {
            if ($r['option_id'] === $response_id) {
                return $r['response'];
            }
        }
        return "No Response";
    }

    public function getAllResponsesString($response_id): string {
        // If this is the first time the responses have been queried, make a DB query.  Otherwise use the existing data.
        if ($this->responses === null) {
            $this->responses = $this->core->getQueries()->getResponses($this->getId());
        }
        if (count($this->responses) === 1) {
            return $this->getResponseString($response_id);
        }
        else {
            $ret_string = "";
            $first_answer = true;
            foreach ($this->responses as $response) {
                if (in_array($response['option_id'], $response_id)) {
                    if (!$first_answer) {
                        $ret_string .= ", " . $response['response'];
                    }
                    else {
                        $first_answer = false;
                        $ret_string .= $response['response'];
                    }
                }
            }
            return $ret_string;
        }
    }

    public function getReleaseDate() {
        return $this->release_date;
    }

    public function isCorrect($response) {
        return in_array($response, $this->getResponses()) && in_array($response, $this->answers);
    }

    public function isInPast() {
        return date("Y-m-d") > $this->release_date;
    }

    public function isInFuture() {
        return date("Y-m-d") < $this->release_date;
    }

    public function isToday() {
        return date("Y-m-d") == $this->release_date;
    }

    public function isHistogramAvailableNever() {
        return $this->release_histogram == "never";
    }

    public function isHistogramAvailableWhenEnded() {
        return $this->release_histogram == "when_ended";
    }

    public function isHistogramAvailableAlways() {
        return $this->release_histogram == "always";
    }

    public function isHistogramAvailable() {
        return ($this->isHistogramAvailableAlways() && !$this->isClosed()) || ($this->isHistogramAvailableWhenEnded() && $this->isEnded());
    }
}
