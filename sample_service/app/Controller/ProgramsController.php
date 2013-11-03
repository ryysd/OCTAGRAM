<?php
class ProgramsController extends AppController {
    public function create() {}
    public function add() {
	if ($this->request->is('post')) {
            $data = $this->request->data['program'];
	    $override = $this->request->data['override'] == "true";

	    $program = $this->Program->find('first', array('conditions' => array('Program.name' => $data['name'])));

	    $alreadyExists = $program != null;
	    $response = array('success' => false, 'exists' => $alreadyExists, 'override' => $override);

	    if ( !$alreadyExists || $override ) {
		$data_url = $this->saveProgram($data['user_id'], $data['name'], $data['serialized_data'], $override);
		if ( $data_url ) {
		    $this->Program->create();

		    $data['data_url'] = $data_url;
		    if ( $alreadyExists && $override ) $data['id'] = $program['Program']['id'];
		    $response['success'] = $this->Program->save($data);
		}
	    }
	}

	$this->response->body(json_encode($response));
	return $this->response;
    }

    private function saveProgram($userId, $name, $data, $override = false) {
	$dir = $this->getProgramDir($userId);

	if ( file_exists($dir) || mkdir($dir, 0777, true) ) {
	    $path = $dir.$name;
	    if ( /*!file_exists($path) || $override*/true ) {
		if ( file_put_contents($path, $data, LOCK_EX) ) {
		    return $path;
		}
	    }
	}

	return false;
    }

    private function getProgramDir($userId) { 
	return WWW_ROOT.'files/programs/'.$userId.'/'; 
    }
}
?>